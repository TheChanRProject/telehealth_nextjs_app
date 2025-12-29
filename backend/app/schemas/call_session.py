from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class CallSessionBase(BaseModel):
    session_id: str
    caller_id: Optional[int] = None
    callee_id: Optional[int] = None
    start_time: datetime = datetime.utcnow()

class CallSessionCreate(CallSessionBase):
    pass

class CallSessionUpdate(BaseModel):
    end_time: datetime

class CallSession(CallSessionBase):
    id: int
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True
