import httpx

from app.services.ai_provider import AIProvider


class GroqProvider(AIProvider):
    """Groq's OpenAI-compatible chat-completions API."""

    def __init__(
        self,
        api_key: str,
        model: str,
    ):
        self.api_key = api_key
        self.model = model

    async def generate(
        self,
        prompt: str,
    ) -> str:

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(
                    60.0,
                    connect=10.0,
                ),
            ) as client:

                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization":
                            f"Bearer {self.api_key}",
                        "Content-Type":
                            "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        "temperature": 0.2,
                    },
                )

                response.raise_for_status()

        except httpx.HTTPStatusError as exc:
            detail = exc.response.text

            raise RuntimeError(
                f"Groq API error "
                f"{exc.response.status_code}: "
                f"{detail}"
            ) from exc

        except httpx.RequestError as exc:
            raise RuntimeError(
                f"Could not connect to Groq API: {exc}"
            ) from exc

        try:
            data = response.json()

            output = (
                data["choices"][0]["message"]["content"]
            )

        except (
            KeyError,
            IndexError,
            TypeError,
            ValueError,
        ) as exc:
            raise RuntimeError(
                "Groq returned an invalid response"
            ) from exc

        if not output:
            raise RuntimeError(
                "Groq returned an empty response"
            )

        return output.strip()