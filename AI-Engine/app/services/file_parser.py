"""
File Parser Service — Trích xuất plaintext từ file PDF/DOCX.

Sử dụng:
- PyMuPDF (fitz) cho file PDF
- python-docx cho file DOCX
- Fallback: đọc raw text cho .txt

Trả về plaintext sạch để đưa vào LLM pipeline.
"""

import io
import structlog

logger = structlog.get_logger(__name__)

# Giới hạn file size: 5MB
MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Trích xuất text từ file PDF bằng PyMuPDF."""
    import fitz

    text_parts = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text("text")
            if page_text.strip():
                text_parts.append(page_text.strip())
        doc.close()
    except Exception as e:
        logger.error("file_parser.pdf_extraction_failed", error=str(e))
        raise ValueError(f"Không thể đọc file PDF: {str(e)}")

    result = "\n\n".join(text_parts)
    if not result.strip():
        raise ValueError(
            "File PDF không chứa text có thể đọc được. "
            "Có thể file chỉ chứa ảnh scan."
        )
    return result


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Trích xuất text từ file DOCX bằng python-docx."""
    from docx import Document

    text_parts = []
    try:
        doc = Document(io.BytesIO(file_bytes))
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                text_parts.append(text)
    except Exception as e:
        logger.error("file_parser.docx_extraction_failed", error=str(e))
        raise ValueError(f"Không thể đọc file DOCX: {str(e)}")

    result = "\n".join(text_parts)
    if not result.strip():
        raise ValueError("File DOCX không chứa nội dung text.")
    return result


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Dispatcher: Xác định loại file và gọi parser tương ứng.

    Args:
        file_bytes: Nội dung file dạng bytes
        filename: Tên file gốc (dùng để xác định extension)

    Returns:
        Plaintext đã trích xuất, sẵn sàng cho LLM pipeline.

    Raises:
        ValueError: Nếu file không hỗ trợ, quá lớn, hoặc không đọc được.
    """
    # Kiểm tra file size
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(
            f"File vượt quá giới hạn {MAX_FILE_SIZE_MB}MB. "
            f"Kích thước file: {len(file_bytes) / (1024 * 1024):.1f}MB"
        )

    # Xác định extension
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Định dạng file '{ext}' không được hỗ trợ. "
            f"Chỉ hỗ trợ: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    logger.info(
        "file_parser.extracting",
        filename=filename,
        extension=ext,
        size_kb=round(len(file_bytes) / 1024, 1),
    )

    if ext == ".pdf":
        text = extract_text_from_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        text = extract_text_from_docx(file_bytes)
    elif ext == ".txt":
        # Thử UTF-8 trước, fallback sang latin-1
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1")
    else:
        raise ValueError(f"Không hỗ trợ định dạng: {ext}")

    # Chuẩn hóa whitespace
    lines = [line.strip() for line in text.splitlines()]
    text = "\n".join(line for line in lines if line)

    logger.info(
        "file_parser.extraction_complete",
        filename=filename,
        text_length=len(text),
        preview=text[:100] + "..." if len(text) > 100 else text,
    )

    return text
