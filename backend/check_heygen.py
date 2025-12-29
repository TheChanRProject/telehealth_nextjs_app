
import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv("HEYGEN_API_KEY")

async def check():
    print(f"Checking HeyGen API Key...")
    if not KEY:
        print("ERROR: HEYGEN_API_KEY is missing from environment.")
        return

    print(f"Key present (starts with {KEY[:4]}...)")

    async with httpx.AsyncClient() as client:
        try:
            print("Attempting to list avatars...")
            response = await client.get(
                "https://api.heygen.com/v1/streaming/avatar.list",
                headers={"X-Api-Key": KEY, "Accept": "application/json"},
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                avatars = data.get("data", [])
                print(f"Success! Found {len(avatars)} avatars.")
                if avatars:
                    print(f"First Avatar Details: {avatars[0]}")
            else:
                print(f"Failed to list avatars: {response.text}")
                return

            print("\nAttempting to create token...")
            token_resp = await client.post(
                "https://api.heygen.com/v1/streaming.create_token",
                headers={"X-Api-Key": KEY},
            )
            if token_resp.status_code != 200:
                print(f"Failed to create token: {token_resp.text}")
                return
            
            print(f"Token Response: {token_resp.json()}")
            token = token_resp.json()["data"]["token"]
            print(f"Token created: {token[:10]}...")

            if avatars:
                avatar_id = avatars[0].get('avatar_id') or avatars[0].get('id')
                print(f"\nAttempting to start session with avatar: {avatar_id}")
                
                # Verify start session via API (simulating SDK)
                # SDK calls https://api.heygen.com/v1/streaming.start
                start_resp = await client.post(
                    "https://api.heygen.com/v1/streaming.start",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "quality": "low",
                        "avatar_name": avatar_id,
                        # "voice": { "voice_id": "DEFAULT" } # SDK doesn't send this by default
                    }
                )
                print(f"Start Session Status: {start_resp.status_code}")
                print(f"Start Session Response: {start_resp.text}")

        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(check())
