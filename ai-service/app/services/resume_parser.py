import io
from fastapi import UploadFile, HTTPException
import logging

try:
    from pdfminer.high_level import extract_text
except ImportError:
    extract_text = None
    logging.warning("pdfminer.six not installed, PDF parsing will fail.")

try:
    from docx import Document
except ImportError:
    Document = None
    logging.warning("python-docx not installed, DOCX parsing will fail.")

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
    logging.warning("pymupdf not installed.")

try:
    import pdfplumber
except ImportError:
    pdfplumber = None
    logging.warning("pdfplumber not installed.")

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    
    # Attempt 1: pdfminer.six (Good for complex layouts)
    if extract_text:
        try:
            text = extract_text(io.BytesIO(file_bytes))
            if text.strip():
                return text
        except Exception as e:
            logger.warning(f"pdfminer failed: {e}")

    # Attempt 2: PyMuPDF (Fast and robust)
    if fitz:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = "".join([page.get_text() for page in doc])
            if text.strip():
                return text
        except Exception as e:
            logger.warning(f"PyMuPDF failed: {e}")

    # Attempt 3: pdfplumber (Good for tables)
    if pdfplumber:
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text = "".join([(page.extract_text() or "") for page in pdf.pages])
                if text.strip():
                    return text
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")

    if not text:
        raise HTTPException(status_code=500, detail="All PDF parsing libraries failed or returned no text.")
    
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    if not Document:
        raise HTTPException(status_code=500, detail="DOCX parsing library not installed.")
    try:
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        logger.error(f"Error parsing DOCX: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse DOCX: {str(e)}")

async def parse_resume(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(content)
    elif filename.endswith(".docx") or filename.endswith(".doc"):
        return extract_text_from_docx(content)
    else:
        # fallback for text files
        try:
            return content.decode("utf-8")
        except:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")
