"""
DealerPulse — Centralized Configuration
"""
import os
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # LLM Provider
    llm_provider: str = Field(default="openai", description="LLM provider: 'openai' or 'ollama'")

    # OpenAI
    openai_api_key: str = Field(default="", description="OpenAI API key")
    openai_model: str = Field(default="gpt-4o", description="OpenAI model name")

    # Ollama
    ollama_base_url: str = Field(default="http://localhost:11434", description="Ollama server URL")
    ollama_model: str = Field(default="llama3.1:8b", description="Ollama model name")

    # Elasticsearch
    elasticsearch_url: str = Field(default="http://localhost:9200", description="Elasticsearch URL")

    # Application
    log_level: str = Field(default="INFO")
    dealer_name: str = Field(default="Prestige Chevrolet", alias="DEALERPULSE_DEALER_NAME")
    dealer_location: str = Field(default="Charlotte, NC", alias="DEALERPULSE_DEALER_LOCATION")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Singleton
settings = Settings()
