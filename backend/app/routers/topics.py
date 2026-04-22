from fastapi import APIRouter

from app.services.topics_service import get_all_topics

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("")
def list_topics() -> dict[str, list[str]]:
    return get_all_topics()
