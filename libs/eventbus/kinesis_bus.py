import asyncio
import json
import logging
import os

import boto3
from botocore.exceptions import ClientError

from .base import EventBus

logger = logging.getLogger(__name__)


class KinesisEventBus(EventBus):
    def __init__(self):
        self.stream_name = os.getenv("KINESIS_STREAM_NAME", "trading-platform-events")
        self.iterator_type = os.getenv("KINESIS_ITERATOR_TYPE", "LATEST")
        self.client = None
        self.handlers = {}
        self.poll_tasks = []

    async def connect(self):
        self.client = boto3.client("kinesis", region_name="us-east-1")

    async def publish(self, topic, event):
        payload = {"topic": topic}
        payload.update(event.model_dump())
        data = json.dumps(payload).encode("utf-8")
        await asyncio.to_thread(
            self.client.put_record,
            StreamName=self.stream_name,
            Data=data,
            PartitionKey=topic,
        )

    async def subscribe(self, topic, model, handler):
        if topic not in self.handlers:
            self.handlers[topic] = []
        self.handlers[topic].append((model, handler))

        if not self.poll_tasks:
            resp = await asyncio.to_thread(
                self.client.list_shards,
                StreamName=self.stream_name,
            )
            for shard in resp["Shards"]:
                task = asyncio.create_task(self.polling(shard["ShardId"]))
                self.poll_tasks.append(task)

    async def polling(self, shard_id):
        resp = await asyncio.to_thread(
            self.client.get_shard_iterator,
            StreamName=self.stream_name,
            ShardId=shard_id,
            ShardIteratorType=self.iterator_type,
        )
        iterator = resp["ShardIterator"]

        while iterator:
            try:
                resp = await asyncio.to_thread(
                    self.client.get_records,
                    ShardIterator=iterator,
                    Limit=100,
                )

                for record in resp["Records"]:
                    data = json.loads(record["Data"].decode("utf-8"))
                    topic = data.pop("topic", None)
                    if topic in self.handlers:
                        for model, handler in self.handlers[topic]:
                            obj = model.model_validate(data)
                            await handler(obj)

                await asyncio.sleep(1.5)
                iterator = resp.get("NextShardIterator")

            except ClientError as exc:
                code = exc.response["Error"]["Code"]
                if code == "ProvisionedThroughputExceededException":
                    logger.warning("[kinesis] throughput exceeded on shard %s, backing off 5s", shard_id)
                    await asyncio.sleep(5)
                elif code == "ExpiredIteratorException":
                    logger.warning("[kinesis] iterator expired on shard %s, refreshing", shard_id)
                    resp = await asyncio.to_thread(
                        self.client.get_shard_iterator,
                        StreamName=self.stream_name,
                        ShardId=shard_id,
                        ShardIteratorType="LATEST",
                    )
                    iterator = resp["ShardIterator"]
                else:
                    logger.error("[kinesis] AWS error on shard %s: %s", shard_id, exc)
                    await asyncio.sleep(5)

            except asyncio.CancelledError:
                return

            except Exception as exc:
                logger.error("[kinesis] unexpected error on shard %s: %s", shard_id, exc, exc_info=True)
                await asyncio.sleep(5)

    async def close(self):
        for task in self.poll_tasks:
            task.cancel()
        await asyncio.gather(*self.poll_tasks, return_exceptions=True)
