from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.call_session import CallSession
from app.schemas.call_session import CallSessionCreate, CallSessionUpdate

def get_call_session(db: Session, session_id: str) -> Optional[CallSession]:
    return db.query(CallSession).filter(CallSession.session_id == session_id).first()

def get_user_call_history(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[CallSession]:
    return db.query(CallSession).filter(
        (CallSession.caller_id == user_id) | (CallSession.callee_id == user_id)
    ).order_by(CallSession.start_time.desc()).offset(skip).limit(limit).all()

def create_call_session(db: Session, call_session: CallSessionCreate) -> CallSession:
    db_obj = CallSession(
        session_id=call_session.session_id,
        caller_id=call_session.caller_id,
        callee_id=call_session.callee_id,
        start_time=call_session.start_time
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_call_session_end_time(db: Session, session_id: str, end_time: datetime) -> Optional[CallSession]:
    db_obj = get_call_session(db, session_id)
    if not db_obj:
        return None
    db_obj.end_time = end_time
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
