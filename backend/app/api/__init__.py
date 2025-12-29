from fastapi import APIRouter

from app.api.endpoints import auth, chat, video, calls

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(video.router, prefix="/video", tags=["video"])
router.include_router(calls.router, prefix="/calls", tags=["calls"])
