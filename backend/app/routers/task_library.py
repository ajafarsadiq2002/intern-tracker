from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import TaskLibrary, User
from app.schemas import TaskLibraryCreate, TaskLibraryUpdate, TaskLibraryResponse

router = APIRouter(prefix="/api/task-library", tags=["task-library"])


@router.get("", response_model=List[TaskLibraryResponse])
def list_task_library(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(TaskLibrary)
    if role:
        query = query.filter(TaskLibrary.role == role)
    if search:
        query = query.filter(TaskLibrary.title.ilike(f"%{search}%"))
    return query.order_by(TaskLibrary.created_at.desc()).all()


@router.post("", response_model=TaskLibraryResponse)
def create_task_library_item(
    task_in: TaskLibraryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db_task = TaskLibrary(**task_in.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=TaskLibraryResponse)
def get_task_library_item(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    task = db.query(TaskLibrary).filter(TaskLibrary.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task library item not found")
    return task


@router.put("/{task_id}", response_model=TaskLibraryResponse)
def update_task_library_item(
    task_id: UUID,
    task_in: TaskLibraryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    task = db.query(TaskLibrary).filter(TaskLibrary.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task library item not found")

    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task_library_item(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    task = db.query(TaskLibrary).filter(TaskLibrary.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task library item not found")
    db.delete(task)
    db.commit()
    return {"message": "Task library item deleted successfully"}
