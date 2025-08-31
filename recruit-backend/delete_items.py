import os
import weaviate
from dotenv import load_dotenv

load_dotenv()


def delete_jobs():
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url="https://vxgp8691qxiatppplkcqg.c0.asia-southeast1.gcp.weaviate.cloud",
        auth_credentials=weaviate.auth.AuthApiKey(
            "WTNydGROdVM5K01ydGRWcF93RlpFem1HR1EyY3crNzNHNHg4c3I1TTAzMXQvQUFLOHc3QklqSkJJMDZFPV92MjAw"
        ),
    )

    try:
        job_collection = client.collections.get("Candidate")

        uuids = [
            "e445c0b7-3e35-4141-b82e-95c2b5f90677",
        ]

        for uid in uuids:
            try:
                job_collection.data.delete_by_id(uid)
                print(f"✅ Deleted Job with UUID {uid}")
            except Exception as e:
                print(f"❌ Failed to delete {uid}: {e}")

    finally:
        client.close()


if __name__ == "__main__":
    delete_jobs()
