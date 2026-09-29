import fitz  # PyMuPDF
import re

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        if text:
            full_text.append(text)
    doc.close()
    return "\n\n".join(full_text)

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 80) -> list[str]:
    """Split text into manageable overlapping chunks for RAG embedding storage."""
    # Clean text
    clean_text = re.sub(r'\s+', ' ', text).strip()
    if not clean_text:
        return []

    chunks = []
    start = 0
    while start < len(clean_text):
        end = min(start + chunk_size, len(clean_text))
        chunk = clean_text[start:end]
        chunks.append(chunk)
        if end >= len(clean_text):
            break
        start += chunk_size - overlap
    return chunks
