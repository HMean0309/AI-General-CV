"""
Step 2A — Embedding Service.

Manages the sentence-transformers model as a singleton
and provides text encoding + cosine similarity functions.
"""

import numpy as np
import structlog

logger = structlog.get_logger(__name__)

# Singleton model instance
_model = None
_model_name = None


def load_model(model_name: str) -> None:
    """
    Pre-load the embedding model during app startup.
    Called from the FastAPI lifespan handler.
    """
    global _model, _model_name
    if _model is not None and _model_name == model_name:
        logger.info("embedding.model_already_loaded", model=model_name)
        return

    logger.info("embedding.loading_model", model=model_name)
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(model_name)
        _model_name = model_name
        logger.info("embedding.model_loaded", model=model_name)
    except Exception as e:
        logger.error("embedding.model_load_failed", model=model_name, error=str(e))
        _model = None
        raise


def get_model():
    """Get the loaded model instance. Raises if not loaded."""
    if _model is None:
        raise RuntimeError(
            "Embedding model not loaded. Call load_model() during app startup."
        )
    return _model


def is_model_loaded() -> bool:
    """Check if the embedding model is loaded."""
    return _model is not None


def encode_texts(texts: list[str]) -> np.ndarray:
    """
    Encode a list of texts into embedding vectors.

    Args:
        texts: List of strings to encode.

    Returns:
        numpy array of shape (len(texts), embedding_dim)
    """
    model = get_model()
    if not texts:
        return np.array([])
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return embeddings


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Compute cosine similarity between two vectors.

    Returns:
        Similarity score between -1 and 1.
    """
    if vec_a.ndim == 1:
        vec_a = vec_a.reshape(1, -1)
    if vec_b.ndim == 1:
        vec_b = vec_b.reshape(1, -1)

    norm_a = np.linalg.norm(vec_a, axis=1, keepdims=True)
    norm_b = np.linalg.norm(vec_b, axis=1, keepdims=True)

    # Avoid division by zero
    norm_a = np.where(norm_a == 0, 1, norm_a)
    norm_b = np.where(norm_b == 0, 1, norm_b)

    similarity = np.dot(vec_a / norm_a, (vec_b / norm_b).T)
    return float(similarity[0][0])


def batch_cosine_similarity(query_vec: np.ndarray, corpus_vecs: np.ndarray) -> np.ndarray:
    """
    Compute cosine similarity between a query vector and a corpus of vectors.

    Args:
        query_vec: Single vector of shape (embedding_dim,)
        corpus_vecs: Matrix of shape (n, embedding_dim)

    Returns:
        Array of similarity scores of shape (n,)
    """
    if query_vec.ndim == 1:
        query_vec = query_vec.reshape(1, -1)

    norm_query = np.linalg.norm(query_vec, axis=1, keepdims=True)
    norm_corpus = np.linalg.norm(corpus_vecs, axis=1, keepdims=True)

    # Avoid division by zero
    norm_query = np.where(norm_query == 0, 1, norm_query)
    norm_corpus = np.where(norm_corpus == 0, 1, norm_corpus)

    similarities = np.dot(query_vec / norm_query, (corpus_vecs / norm_corpus).T)
    return similarities.flatten()
