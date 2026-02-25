import os
import numpy as np
from typing import List, Dict, Any

class VectorStoreManager:
    """Manages local vector storage for RAG-based resume analysis.
    
    Imports for FAISS, HuggingFaceEmbeddings, and LangChain are deferred
    to first use to avoid startup failures when torch/accelerate have
    version incompatibilities.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self._model_name = model_name
        self._embeddings = None
        self._text_splitter = None
        self.vector_db = None

    @property
    def embeddings(self):
        if self._embeddings is None:
            try:
                from langchain_huggingface import HuggingFaceEmbeddings
                self._embeddings = HuggingFaceEmbeddings(model_name=self._model_name)
            except Exception as e:
                print(f"[VectorStore] Failed to load HuggingFaceEmbeddings: {e}")
                print("[VectorStore] RAG features will be unavailable.")
                return None
        return self._embeddings

    @property
    def text_splitter(self):
        if self._text_splitter is None:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            self._text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50
            )
        return self._text_splitter

    def create_store_from_text(self, text: str, store_id: str):
        """Creates a FAISS index from the provided text."""
        if not self.embeddings:
            print("[VectorStore] Embeddings unavailable, skipping store creation.")
            return None
        from langchain_community.vectorstores import FAISS
        from langchain_core.documents import Document
        chunks = self.text_splitter.split_text(text)
        documents = [Document(page_content=chunk, metadata={"source": store_id}) for chunk in chunks]
        
        self.vector_db = FAISS.from_documents(documents, self.embeddings)
        return self.vector_db

    def query(self, query: str, k: int = 3) -> List:
        """Retrieves relevant chunks from the vector store."""
        if not self.vector_db:
            return []
        return self.vector_db.similarity_search(query, k=k)

    def save_local(self, path: str):
        """Saves the index to disk."""
        if self.vector_db:
            self.vector_db.save_local(path)

    def load_local(self, path: str):
        """Loads a stored index."""
        if not self.embeddings:
            print("[VectorStore] Embeddings unavailable, cannot load store.")
            return None
        from langchain_community.vectorstores import FAISS
        self.vector_db = FAISS.load_local(path, self.embeddings, allow_dangerous_deserialization=True)
        return self.vector_db

# Singleton instance for the service
vector_manager = VectorStoreManager()
