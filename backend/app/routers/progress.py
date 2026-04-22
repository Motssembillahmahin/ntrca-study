from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.progress import ProgressStats
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=ProgressStats)
def get_progress(db: Session = Depends(get_db)):
    return ProgressService(db).get_stats()
