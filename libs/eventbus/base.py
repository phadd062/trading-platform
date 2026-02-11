from abc import ABC, abstractmethod


class EventBus(ABC):
    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def publish(self, topic, event):
        pass

    @abstractmethod
    async def subscribe(self, topic, model, handler):
        pass

    @abstractmethod
    async def close(self):
        pass
