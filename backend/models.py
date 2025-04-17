from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_public = Column(Integer, default=0)  # 0 for private, 1 for public
    messages = relationship("Message", back_populates="chat")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String, ForeignKey("chats.chat_id"))
    content = Column(Text)
    role = Column(String)  # 'user' or 'assistant'
    created_at = Column(DateTime, default=datetime.utcnow)
    chat = relationship("Chat", back_populates="messages")

# Create SQLite database
engine = create_engine("sqlite:///./ml_papers.db")
Base.metadata.create_all(bind=engine) 