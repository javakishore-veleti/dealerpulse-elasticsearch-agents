"""
DealerPulse — Elasticsearch Connection
"""
from elasticsearch import Elasticsearch
from config.settings import settings


def get_es_client() -> Elasticsearch:
    """Returns a configured Elasticsearch client."""
    return Elasticsearch(
        settings.elasticsearch_url,
        request_timeout=30,
        retry_on_timeout=True,
        max_retries=3,
    )


def check_es_health() -> dict:
    """Check Elasticsearch cluster health."""
    es = get_es_client()
    return es.cluster.health()
