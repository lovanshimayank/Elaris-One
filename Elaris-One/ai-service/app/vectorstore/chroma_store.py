import re

class SimpleVectorStore:
    """In-memory semantic vector store for academic notes and documents"""
    def __init__(self):
        self.documents = []

    def add_document(self, doc_id: str, title: str, text: str, metadata: dict = None):
        paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) > 30]
        for idx, para in enumerate(paragraphs):
            self.documents.append({
                "doc_id": doc_id,
                "chunk_id": f"{doc_id}_chunk_{idx}",
                "title": title,
                "text": para,
                "metadata": metadata or {}
            })

    def search(self, query: str, top_k: int = 4) -> list:
        query_words = set(re.findall(r"\w+", query.lower()))
        scored = []
        for doc in self.documents:
            doc_words = set(re.findall(r"\w+", doc["text"].lower()))
            overlap = len(query_words.intersection(doc_words))
            if overlap > 0:
                score = overlap / (len(query_words) + 1)
                scored.append((score, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

vector_store = SimpleVectorStore()