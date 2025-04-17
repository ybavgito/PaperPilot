from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import arxiv
import json
from sqlalchemy.orm import Session
from database import get_db, create_chat, add_message, get_chat, get_chat_messages, get_public_chats
from pydantic import BaseModel
import uuid
from datetime import datetime, timedelta

app = FastAPI(title="ML Paper Search Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    content: str
    role: str

class ChatCreate(BaseModel):
    is_public: bool = False

class SearchFilters(BaseModel):
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    authors: Optional[List[str]] = None
    categories: Optional[List[str]] = None

@app.get("/")
async def root():
    return {"message": "ML Paper Search Engine API"}

@app.get("/search")
async def search_papers(
    query: str,
    max_results: int = Query(default=10, le=100),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    authors: Optional[str] = None,
    categories: Optional[str] = None,
    sort_by: str = Query(default="relevance", enum=["relevance", "lastUpdated", "submitted"])
):
    try:
        # Build the search query with filters
        search_query = query

        # Add date filters
        if date_from or date_to:
            date_filter = []
            if date_from:
                date_filter.append(f"submittedDate:[{date_from}*]")
            if date_to:
                date_filter.append(f"submittedDate:[* TO {date_to}]")
            search_query += " AND " + " AND ".join(date_filter)

        # Add author filters
        if authors:
            author_list = [author.strip() for author in authors.split(",")]
            author_filter = " OR ".join([f'au:"{author}"' for author in author_list])
            search_query += f" AND ({author_filter})"

        # Add category filters
        if categories:
            category_list = [cat.strip() for cat in categories.split(",")]
            cat_filter = " OR ".join([f'cat:{cat}' for cat in category_list])
            search_query += f" AND ({cat_filter})"

        # Configure sorting
        sort_criterion = {
            "relevance": arxiv.SortCriterion.Relevance,
            "lastUpdated": arxiv.SortCriterion.LastUpdatedDate,
            "submitted": arxiv.SortCriterion.SubmittedDate
        }[sort_by]

        search = arxiv.Search(
            query=search_query,
            max_results=max_results,
            sort_by=sort_criterion
        )
        
        results = []
        for result in search.results():
            paper = {
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "summary": result.summary,
                "pdf_url": result.pdf_url,
                "published": result.published.isoformat(),
                "updated": result.updated.isoformat() if result.updated else None,
                "arxiv_id": result.entry_id.split('/')[-1],
                "categories": result.categories,
                "comment": result.comment,
                "journal_ref": result.journal_ref,
                "doi": result.doi
            }
            results.append(paper)
        
        return JSONResponse(content={"papers": results})
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/categories")
async def get_categories():
    # Common arXiv ML-related categories
    categories = {
        "cs.AI": "Artificial Intelligence",
        "cs.LG": "Machine Learning",
        "cs.CL": "Computation and Language",
        "cs.CV": "Computer Vision",
        "cs.NE": "Neural and Evolutionary Computing",
        "cs.RO": "Robotics",
        "stat.ML": "Machine Learning (Statistics)",
    }
    return {"categories": categories}

@app.post("/chats")
async def create_new_chat(chat: ChatCreate, db: Session = Depends(get_db)):
    new_chat = create_chat(db, chat.is_public)
    return {"chat_id": new_chat.chat_id}

@app.get("/chats/{chat_id}")
async def get_chat_history(chat_id: str, db: Session = Depends(get_db)):
    chat = get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = get_chat_messages(db, chat_id)
    return {"messages": [{"content": msg.content, "role": msg.role} for msg in messages]}

@app.post("/chats/{chat_id}/messages")
async def add_chat_message(chat_id: str, message: Message, db: Session = Depends(get_db)):
    chat = get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    new_message = add_message(db, chat_id, message.content, message.role)
    return {"message": "Message added successfully"}

@app.get("/chats/public")
async def get_public_chats_list(db: Session = Depends(get_db)):
    public_chats = get_public_chats(db)
    return {"chats": [{"chat_id": chat.chat_id, "created_at": chat.created_at} for chat in public_chats]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 