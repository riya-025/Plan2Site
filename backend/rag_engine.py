import json
import numpy as np

# Try importing sentence_transformers, or fallback to TF-IDF cosine similarity
st_model = None
try:
    from sentence_transformers import SentenceTransformer
    # Fast lightweight model
    st_model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"SentenceTransformer fallback mode: {e}")

def get_embedding(text: str) -> list[float]:
    """Generate vector embedding for given text string."""
    if st_model is not None:
        try:
            vec = st_model.encode(text)
            return vec.tolist()
        except Exception:
            pass
    
    # Lightweight deterministic n-gram vectorizer fallback
    words = text.lower().split()
    vocab = ["site", "prep", "excavation", "foundation", "column", "beam", "brickwork",
             "electrical", "plumbing", "plastering", "flooring", "painting", "inspection",
             "concrete", "day", "planned", "delay", "progress", "material", "water", "tile"]
    vec = [0.0] * len(vocab)
    for i, word in enumerate(vocab):
        vec[i] = float(words.count(word))
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = (np.array(vec) / norm).tolist()
    return vec

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Calculate cosine similarity between two numeric vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)
    if len(a) != len(b):
        # Truncate or pad to match
        min_len = min(len(a), len(b))
        a = a[:min_len]
        b = b[:min_len]
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

def retrieve_relevant_chunks(db_conn, project_id: int, query: str, top_k: int = 3) -> list[dict]:
    """RAG Retrieval: Find top-K most relevant PDF text chunks for given query."""
    cursor = db_conn.cursor()
    cursor.execute("SELECT id, chunk_index, text_content, embedding_json FROM pdf_chunks WHERE project_id = ?", (project_id,))
    rows = cursor.fetchall()
    
    if not rows:
        return []
    
    query_vec = get_embedding(query)
    scored_chunks = []
    
    for row in rows:
        chunk_id, idx, content, emb_json = row["id"], row["chunk_index"], row["text_content"], row["embedding_json"]
        if emb_json:
            chunk_vec = json.loads(emb_json)
        else:
            chunk_vec = get_embedding(content)
        
        score = cosine_similarity(query_vec, chunk_vec)
        scored_chunks.append({
            "chunk_id": chunk_id,
            "chunk_index": idx,
            "text": content,
            "similarity_score": score
        })
    
    scored_chunks.sort(key=lambda x: x["similarity_score"], reverse=True)
    return scored_chunks[:top_k]
