from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        """Generate a response for the given prompt."""
        raise NotImplementedError