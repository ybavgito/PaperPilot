# ML Paper Search Engine

A search engine for machine learning papers that allows users to ask questions about ML topics and get relevant paper recommendations with citations and figures.

## Features

- Search and discover ML papers
- Chat interface for asking questions
- LaTeX rendering support
- Save and share chats
- No login required
- Public and private chat options

## Tech Stack

- Python 3.8+
- Node.js 14+
- npm or yarn


## API Endpoints

- `GET /search?query={query}`: Search for papers
- `POST /chats`: Create a new chat
- `GET /chats/{chat_id}`: Get chat history
- `POST /chats/{chat_id}/messages`: Add a message to chat
- `GET /chats/public`: Get list of public chats
