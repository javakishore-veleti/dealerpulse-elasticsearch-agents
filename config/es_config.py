"""
DealerPulse — Elasticsearch Connection
"""
import os
from elasticsearch import Elasticsearch
from config.settings import settings


def get_es_client() -> Elasticsearch:
    """Returns a configured Elasticsearch client."""
    api_key = os.getenv("ELASTIC_API_KEY", "")

    if api_key:
        return Elasticsearch(
            settings.elasticsearch_url,
            api_key=api_key,
            request_timeout=30,
            retry_on_timeout=True,
            max_retries=3,
        )

    return Elasticsearch(
        settings.elasticsearch_url,
        request_timeout=30,
        retry_on_timeout=True,
        max_retries=3,
    )


def check_es_health() -> dict:
    """Check Elasticsearch health (works with both serverless and hosted)."""
    es = get_es_client()
    try:
        return es.cluster.health()
    except Exception:
        try:
            info = es.info()
            return {"status": "ok", "cluster_name": info.get("cluster_name", "serverless"), "version": info["version"]["number"]}
        except Exception as e:
            return {"status": "error", "error": str(e)}