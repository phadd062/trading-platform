import os

from libs.eventbus.kinesis_bus import KinesisEventBus
from libs.eventbus.nats_bus import NatsEventBus


def EventBus():
    backend = os.getenv("BUS_BACKEND")
    if backend == "kinesis":
        return KinesisEventBus()
    return NatsEventBus()
