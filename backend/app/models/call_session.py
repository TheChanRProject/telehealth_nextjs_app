from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Sequence
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class CallSession(Base):
    __tablename__ = "call_sessions"

    id = Column(Integer, Sequence("call_session_id_seq"), primary_key=True)
    # unique session identifier for invite links
    session_id = Column(String, unique=True, index=True, nullable=False) 
    
    caller_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for guest callers
    callee_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for guest callees

    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    # Relationships
    caller = relationship("User", foreign_keys=[caller_id])
    callee = relationship("User", foreign_keys=[callee_id])
