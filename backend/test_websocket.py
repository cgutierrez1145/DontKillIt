#!/usr/bin/env python3
"""Test WebSocket notification connection."""
import asyncio
import websockets
import json

async def test_websocket():
    # Token from our test user
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImV4cCI6MTc2NzU2MTg0N30.S64ds50fxkzzmbh8Af0z8A8agjJYC1UR4XFmO2qN8Bc"
    uri = f"ws://localhost:8000/api/v1/ws/notifications?token={token}"

    print(f"Connecting to {uri}...")

    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")

            # Send a ping
            print("\n📤 Sending ping...")
            await websocket.send(json.dumps({"type": "ping"}))

            # Wait for pong response
            print("⏳ Waiting for pong...")
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)
            print(f"📥 Received: {data}")

            if data.get("type") == "pong":
                print("✅ Ping/pong test passed!")

            # Keep connection open for a bit to test notifications
            print("\n⏳ Keeping connection open for 5 seconds to test notifications...")
            print("(You can trigger a notification from another terminal)")

            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(response)
                    print(f"📥 Received notification: {json.dumps(data, indent=2)}")
            except asyncio.TimeoutError:
                print("⏰ Timeout reached, closing connection")

            print("\n✅ WebSocket test completed successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(test_websocket())
