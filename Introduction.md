# Nexus AI Platform: Introduction & Architecture

## Project Vision
**Nexus AI Platform** is an open-source, premium AI Workspace designed to provide a ChatGPT/Claude-like experience. Its primary focus is on **Zero API Costs** by utilizing local AI proxies like `gemini-web2api` (and local models via Ollama) to provide state-of-the-art AI capabilities for free. 

However, it also fully supports premium paid APIs (OpenAI, Anthropic Claude, Groq, etc.) which can be configured as backups, fallback models, or primary drivers for users who prefer them. It acts as an advanced workspace where users can chat, search, analyze files, and manage projects.

## Tech Stack
### Frontend
- **Framework:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
- **State/Form:** TanStack Query, React Hook Form, Zod
- **Markdown:** React Markdown, remark-gfm, rehype-highlight

### Backend
- **Core:** FastAPI (Python 3.13)
- **Database ORM:** SQLAlchemy, Alembic
- **Task Queue:** Redis, Celery
- **Real-time:** WebSockets, SSE Streaming
- **AI Integration:** OpenAI SDK (configured for local `gemini-web2api` by default), Anthropic SDK, Groq, and Ollama. Supports both free local routing and official paid API keys.

### Database
- **Primary:** PostgreSQL
- **Caching:** Redis
- **Storage:** S3 / MinIO (for file uploads)
- **Vector DB:** pgvector or Qdrant (for RAG)

### Infrastructure
- Docker, Docker Compose, Nginx/Traefik, GitHub Actions

## Core Features
- **Authentication:** Google, GitHub, Email/Password, Magic Link.
- **Chat Interface:** Streaming, Markdown, Code blocks, Token/Cost counter (simulated), Chat history.
- **Multi-Model Support (Free & Paid):** 
  - **Free Tier (Primary):** `gemini-3.5-flash` and `gemini-3.5-flash-thinking` (via gemini-web2api proxy). Local models via Ollama (Llama, DeepSeek).
  - **Premium Tier (Backup/Optional):** OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Groq, DeepSeek API, etc. (Requires user-provided API keys).
- **Workspace & RAG:** Upload PDFs, TXTs, generate vector embeddings, and chat with documents.
- **Web Search:** Integrated search pipeline mimicking Perplexity.
- **AI Agents:** Specialized agents for Coding, Research, Data Analysis, etc.

---

## Development Roadmap & Phases
To build this massive platform systematically, the work is divided into 5 phases. Detailed guides for each phase are located in this folder.

- **Phase 1: Foundation & Basic Chat** (`phase1.md`) 
  - *Purpose:* Establish the core app, UI, and connect it to the free Gemini proxy.
- **Phase 2: RAG & File Processing** (`phase2.md`) 
  - *Purpose:* Add document uploads, vector embeddings, and "chat with PDF" functionality.
- **Phase 3: Advanced AI & Agents** (`phase3.md`) 
  - *Purpose:* Implement tool calling, web search, and autonomous specialized agents.
- **Phase 4: Workspaces & Admin** (`phase4.md`) 
  - *Purpose:* Add teams, organizations, prompt libraries, and an admin dashboard.
- **Phase 5: Deployment & Scaling** (`phase5.md`) 
  - *Purpose:* Dockerize everything, setup CI/CD, SSL, and deploy to a production server.
