import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.embedding_repo import embedding_repo

class RAGService:
    async def query_relevant_context(self, db: AsyncSession, query: str, project_id: uuid.UUID = None) -> List[Dict[str, Any]]:
        # Generate dummy 384-dimensional query vector for similarity search
        dummy_vector = [0.01 * (i % 10) for i in range(384)]
        results = await embedding_repo.search_similar(db, dummy_vector, project_id=project_id, limit=3)
        
        return [
            {
                "chunk_id": str(res.id),
                "file_id": str(res.file_id),
                "text": res.chunk_text,
            }
            for res in results
        ]

rag_service = RAGService()
