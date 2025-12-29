import uuid
from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.crud import crud_call_session

router = APIRouter()

@router.post("/invite", response_model=schemas.call_session.CallSession)
def create_invite(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new call session/invite link.
    """
    session_id = str(uuid.uuid4())
    call_in = schemas.call_session.CallSessionCreate(
        session_id=session_id,
        caller_id=current_user.id
    )
    call_session = crud_call_session.create_call_session(db=db, call_session=call_in)
    return call_session

@router.get("/history", response_model=List[schemas.call_session.CallSession])
def read_call_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve call history for the current user.
    """
    history = crud_call_session.get_user_call_history(db, user_id=current_user.id, skip=skip, limit=limit)
    return history

@router.post("/{session_id}/end", response_model=schemas.call_session.CallSession)
def end_call_session(
    session_id: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a call session as ended.
    """
    call = crud_call_session.get_call_session(db, session_id=session_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call session not found")
    
    # Only participant can end? For now open.
    updated_call = crud_call_session.update_call_session_end_time(db, session_id=session_id, end_time=datetime.utcnow())
    return updated_call
