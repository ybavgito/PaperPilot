from sqlalchemy.orm import Session
from models import Chat, Message, engine
import uuid
from typing import List, Optional

def get_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

def create_chat(db: Session, is_public: bool = False) -> Chat:
    chat_id = str(uuid.uuid4())
    chat = Chat(chat_id=chat_id, is_public=1 if is_public else 0)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

def add_message(db: Session, chat_id: str, content: str, role: str) -> Message:
    message = Message(chat_id=chat_id, content=content, role=role)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_chat(db: Session, chat_id: str) -> Optional[Chat]:
    return db.query(Chat).filter(Chat.chat_id == chat_id).first()

def get_chat_messages(db: Session, chat_id: str) -> List[Message]:
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()

def get_public_chats(db: Session) -> List[Chat]:
    return db.query(Chat).filter(Chat.is_public == 1).all() 