import httpx

from app.services.ai_provider import AIProvider


class OllamaProvider(AIProvider):
    def __init__(
        self,
        base_url: str,
        model: str,
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate(self, prompt: str) -> str:
        try:
            timeout = httpx.Timeout(
                connect=10.0,
                read=300.0,
                write=10.0,
                pool=10.0,
            )

            async with httpx.AsyncClient(
                timeout=timeout,
            ) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                    },
                )

                response.raise_for_status()

        except httpx.ReadTimeout as exc:
            raise RuntimeError(
                f"Ollama response timed out for model '{self.model}'"
            ) from exc

        except httpx.HTTPError as exc:
            raise RuntimeError(
                f"Ollama request failed for model '{self.model}'"
            ) from exc

        data = response.json()
        output = data.get("response")

        if not output:
            raise RuntimeError(
                "Ollama returned an empty response"
            )

        return output.strip()