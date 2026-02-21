import json
import os

from nats.aio.client import Client as NATS

from .base import EventBus


class NatsEventBus(EventBus):
    def __init__(self, url = os.getenv("NATS_URL")):
        self.url = url
        self.nc = NATS()

    async def connect(self):
        if self.nc.is_connected:
            return
        await self.nc.connect(servers=[self.url])

    async def publish(self, topic, event):
        payload = event.model_dump()
        await self.nc.publish(topic, json.dumps(payload).encode("utf-8"))

    async def subscribe(self, topic, model, handler):
        async def subscripe_message(msg):
            data = json.loads(msg.data.decode("utf-8"))
            obj = model.model_validate(data)
            await handler(obj)

        await self.nc.subscribe(topic, cb=subscripe_message)

    async def close(self):
        if self.nc.is_connected:
            await self.nc.drain()
            await self.nc.close()
