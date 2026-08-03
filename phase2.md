# Phase 2: RAG, Memory & File Processing

## Objective
Transform the basic chatbot into a smart workspace capable of reading user files, storing long-term memory, and performing Retrieval-Augmented Generation (RAG).

## 1. File Storage Infrastructure
- Set up MinIO (S3-compatible local storage) in Docker.
- Update FastAPI to handle file uploads securely via multipart/form-data.
- Create UI drag-and-drop zones in the chat input for PDFs, DOCX, TXT, CSV, and Images.

## 2. Vector Database Setup
- Add `pgvector` to the existing PostgreSQL database (or deploy Qdrant).
- Create tables/collections for `Embeddings` and `Document_Chunks`.

## 3. The RAG Pipeline
- **Parsing:** Use Python libraries (e.g., `PyMuPDF` for PDF, `pandas` for CSV, `python-docx` for Word) to extract raw text.
- **Chunking:** Split documents into smaller semantic chunks (using LangChain text splitters).
- **Embedding:** Use a free/local embedding model (via Ollama or HuggingFace `sentence-transformers`) to convert chunks into vectors. *Do not use OpenAI's paid embedding API.*
- **Retrieval:** When a user asks a question, embed the query, and search the Vector DB for the top 5 most relevant chunks.

## 4. Injecting Context
- Modify the AI Pipeline in FastAPI:
  `User Prompt -> Vector DB Search -> Append retrieved text to System Prompt -> Send to gemini-web2api`.

## 5. UI Updates
- Show uploaded files visually above the chat input.
- Add citation badges in the chat response when the AI uses specific uploaded documents to formulate its answer.
