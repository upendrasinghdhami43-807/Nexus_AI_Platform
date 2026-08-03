# Phase 1: Foundation & Basic Chat (MVP)

## Objective
Establish the core architecture, set up the database and authentication, build the ChatGPT-like UI, and successfully connect the chat to our local `gemini-web2api` instance without using paid API keys.

## 1. Project Initialization
- Create the monorepo structure (`apps/web`, `backend/`).
- Initialize Next.js 15 for the frontend.
- Initialize FastAPI (Python 3.13) for the backend.
- Set up Docker Compose for local development (PostgreSQL, Redis).

## 2. Database & Authentication
- **Backend:** Set up SQLAlchemy with PostgreSQL. Create `Users`, `Sessions`, `Chats`, and `Messages` tables.
- **Auth:** Implement JWT-based authentication in FastAPI.
- **Frontend:** Implement login/signup screens using shadcn/ui. Integrate Google/GitHub OAuth if desired.

## 3. The Chat UI
- Build the Sidebar (New Chat, Chat History, Folders).
- Build the Main Chat area (Message bubbles, Input box with auto-resize).
- Implement Markdown rendering (`react-markdown`) with syntax highlighting (`rehype-highlight`).
- Add standard UI buttons (Copy, Edit, Regenerate, Model Selector).

## 4. Zero-Cost LLM Integration
- Ensure `gemini-web2api` is running locally on port 8081.
- In FastAPI, configure the OpenAI Python SDK to use the local endpoint instead of OpenAI's servers:
  ```python
  from openai import AsyncOpenAI
  client = AsyncOpenAI(
      base_url="http://localhost:8081/v1",
      api_key="nexus-local-key" # Dummy key for the proxy
  )
  ```
- Create the `/api/chat/stream` endpoint in FastAPI to handle SSE (Server-Sent Events) streaming to Next.js.

## 5. End-to-End Testing
- User logs in -> creates new chat -> types a message.
- Next.js sends request to FastAPI.
- FastAPI routes request to `gemini-web2api`.
- Response streams back to the UI in real-time.
