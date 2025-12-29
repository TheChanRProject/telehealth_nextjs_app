from typing import Annotated
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from jose import JWTError, jwt

from app.core.config import settings
from app.websockets.connection_manager import manager
from app.schemas.user import TokenPayload

router = APIRouter()

async def get_current_user_ws(
    token: Annotated[str, Query()]
) -> int:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        if token_data.sub is None:
            # In WS, we might just close code 1008
            return None
        return token_data.sub
    except JWTError:
        return None

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: int,
    token: str = Query(...)  # Expect token in query param
):
    # Verify token
    user_id = await get_current_user_ws(token)
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # In a real app, client_id might be the room ID or target ID.
    # For now, let's treat it as connecting to the global chat as 'user_id'
    
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Simple echo/broadcast for now
            # In reality, we would parse JSON, save to DB, and send to specific recipient
            await manager.broadcast(f"User {user_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        await manager.broadcast(f"User {user_id} left the chat")
