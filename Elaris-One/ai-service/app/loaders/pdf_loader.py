import os
import pymupdf as fitz

def extract_text_from_pdf(file_path: str, max_pages: int = 50) -> dict:
    """Extract text and structure from PDF notes using PyMuPDF"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    doc = fitz.open(file_path)
    total_pages = len(doc)
    extracted_text = []
    pages_data = []

    pages_to_read = min(total_pages, max_pages)
    for page_num in range(pages_to_read):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if text:
            extracted_text.append(text)
            pages_data.append({
                "page": page_num + 1,
                "chars": len(text),
                "snippet": text[:150]
            })

    full_text = "\n\n".join(extracted_text)
    return {
        "totalPages": total_pages,
        "pagesRead": pages_to_read,
        "text": full_text,
        "pages": pages_data,
        "wordCount": len(full_text.split())
    }