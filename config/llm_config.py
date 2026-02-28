"""
DealerPulse — LLM Provider Abstraction
Supports OpenAI and Ollama with a single interface.
"""
from langchain_core.language_models import BaseChatModel
from config.settings import settings


def get_llm(temperature: float = 0.1) -> BaseChatModel:
    """
    Returns the configured LLM instance based on LLM_PROVIDER setting.
    
    - "openai" → ChatOpenAI (GPT-4o)
    - "ollama" → ChatOllama (Llama 3.1 or configured model)
    """
    provider = settings.llm_provider.lower()

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            temperature=temperature,
        )
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            temperature=temperature,
        )
    else:
        raise ValueError(f"Unknown LLM provider: {provider}. Use 'openai' or 'ollama'.")
