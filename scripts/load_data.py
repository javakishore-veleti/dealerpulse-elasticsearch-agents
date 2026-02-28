"""
DealerPulse — Data Loader
Creates indices, loads synthetic data into Elasticsearch.
"""
import sys
import time
import json
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

sys.path.insert(0, "/app" if __name__ != "__main__" else ".")

from config.es_config import get_es_client
from data.mappings.index_mappings import MAPPINGS
from data.synthetic.generate_all import generate_all


def wait_for_es(es: Elasticsearch, max_retries: int = 30):
    """Wait for Elasticsearch to be ready."""
    for i in range(max_retries):
        try:
            health = es.cluster.health()
            status = health.get("status", "red")
            if status in ["green", "yellow"]:
                print(f"✓ Elasticsearch is ready (status: {status})")
                return True
        except Exception:
            pass
        print(f"  Waiting for Elasticsearch... ({i+1}/{max_retries})")
        time.sleep(2)
    
    print("✗ Elasticsearch did not become ready in time.")
    return False


def create_indices(es: Elasticsearch):
    """Create all indices with mappings."""
    print("\n── Creating Indices ──")
    for index_name, mapping in MAPPINGS.items():
        if es.indices.exists(index=index_name):
            es.indices.delete(index=index_name)
            print(f"  Deleted existing index: {index_name}")
        
        es.indices.create(index=index_name, body=mapping)
        print(f"  ✓ Created index: {index_name}")


def load_data(es: Elasticsearch, data: dict):
    """Bulk load data into Elasticsearch indices."""
    print("\n── Loading Data ──")
    total = 0
    
    for index_name, records in data.items():
        actions = [
            {"_index": index_name, "_source": record}
            for record in records
        ]
        
        success, errors = bulk(es, actions, refresh=True)
        total += success
        
        if errors:
            print(f"  ✗ {index_name}: {success} loaded, {len(errors)} errors")
        else:
            print(f"  ✓ {index_name}: {success} records loaded")
    
    return total


def verify_data(es: Elasticsearch):
    """Verify all indices have data."""
    print("\n── Verifying Data ──")
    all_good = True
    
    for index_name in MAPPINGS.keys():
        count = es.count(index=index_name)["count"]
        status = "✓" if count > 0 else "✗"
        print(f"  {status} {index_name}: {count} documents")
        if count == 0:
            all_good = False
    
    return all_good


def main():
    """Main data loading pipeline."""
    print("═══════════════════════════════════════")
    print("  DealerPulse — Data Loader")
    print("═══════════════════════════════════════")
    
    es = get_es_client()
    
    # Wait for ES
    if not wait_for_es(es):
        sys.exit(1)
    
    # Create indices
    create_indices(es)
    
    # Generate synthetic data
    print("\n── Generating Synthetic Data ──")
    data = generate_all()
    for name, records in data.items():
        print(f"  Generated {len(records)} records for {name}")
    
    # Load data
    total = load_data(es, data)
    
    # Verify
    all_good = verify_data(es)
    
    print(f"\n{'═' * 40}")
    if all_good:
        print(f"  ✓ Successfully loaded {total} records across {len(MAPPINGS)} indices")
    else:
        print(f"  ⚠ Loaded {total} records but some indices may be empty")
    print(f"{'═' * 40}\n")


if __name__ == "__main__":
    main()
