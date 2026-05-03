import fitz  # PyMuPDF
import io


def extract_text_from_pdf(file_bytes: bytes, filename: str = "") -> str:
    """Extract text from a PDF file given its bytes."""
    try:
        pdf_stream = io.BytesIO(file_bytes)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Error parsing {filename}: {e}")
        return ""
