import json
import httpx
from typing import Annotated
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status, HTTPException, Depends
from jose import JWTError, jwt

from app.core.config import settings
from app.websockets.connection_manager import manager
from app.schemas.user import TokenPayload
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/heygen-token")
async def get_heygen_token(current_user = Depends(get_current_active_user)):
    """
    Generate a temporary access token for HeyGen Streaming Avatar SDK.
    """
    # Placeholder for API key check - in productin enforce settings.HEYGEN_API_KEY
    if not settings.HEYGEN_API_KEY:
         # For demo purposes, we might just return a mock if no key, but sdk needs real one.
         # The user knows they need to add it.
         raise HTTPException(status_code=500, detail="HeyGen API Key not configured")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.heygen.com/v1/streaming.create_token",
                headers={"X-Api-Key": settings.HEYGEN_API_KEY},
            )
            response.raise_for_status()
            data = response.json()
            return {"token": data["data"]["token"]}
        except Exception as e:
            # If invalid key or error, pass it up
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/heygen-avatars")
async def list_heygen_avatars(current_user = Depends(get_current_active_user)):
    """
    List available HeyGen Streaming Avatars.
    """
    if not settings.HEYGEN_API_KEY:
        raise HTTPException(status_code=500, detail="HeyGen API Key not configured")

    async with httpx.AsyncClient() as client:
        try:
            # Endpoint for listing streaming avatars
            response = await client.get(
                "https://api.heygen.com/v1/streaming/avatar.list",
                headers={"X-Api-Key": settings.HEYGEN_API_KEY},
            )
            response.raise_for_status()
            data = response.json()
            return data["data"] # Returns list of avatars w/ avatar_id
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


async def get_current_user_ws(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenPayload(**payload)
        return token_data.sub
    except JWTError:
        return None

@router.websocket("/signal/{client_id}")
async def websocket_signaling(
    websocket: WebSocket,
    client_id: int,
    token: str = Query(...)
):
    user_id = await get_current_user_ws(token)
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                target_id = data.get("target_id")
                
                if target_id:
                    # Forward the signaling message to the target user
                    # In a real app, include metadata about who sent it
                    forward_data = {
                        "sender_id": user_id,
                        "type": data.get("type"),
                        "payload": data.get("payload"), # SDP or ICE candidate
                    }
                    await manager.send_personal_message(json.dumps(forward_data), int(target_id))
                else:
                    # Maybe just a ping or invalid message
                    pass
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        # Notify others? For now, no implicit presence system.
