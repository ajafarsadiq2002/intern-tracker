from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_active_user
from app.database import get_db
from app.models import TaskAssignment, TaskLibrary, Intern, User
from app.schemas import TaskAssignmentCreate, TaskAssignmentUpdate, TaskAssignmentResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskAssignmentResponse])
def list_task_assignments(
    intern_id: Optional[UUID] = Query(None),
    task_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(TaskAssignment).options(
        joinedload(TaskAssignment.task), joinedload(TaskAssignment.intern)
    )
    if intern_id:
        query = query.filter(TaskAssignment.intern_id == intern_id)
    if task_id:
        query = query.filter(TaskAssignment.task_id == task_id)
    if status:
        query = query.filter(TaskAssignment.status == status)
    if search:
        query = query.join(TaskLibrary).filter(TaskLibrary.title.ilike(f"%{search}%"))
    return query.order_by(TaskAssignment.created_at.desc()).all()


@router.post("", response_model=TaskAssignmentResponse)
def create_task_assignment(
    assignment_in: TaskAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    task = db.query(TaskLibrary).filter(TaskLibrary.id == assignment_in.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found in library")

    intern = db.query(Intern).filter(Intern.id == assignment_in.intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")

    existing = (
        db.query(TaskAssignment)
        .filter(
            TaskAssignment.task_id == assignment_in.task_id,
            TaskAssignment.intern_id == assignment_in.intern_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="This task is already assigned to this intern")

    db_assignment = TaskAssignment(**assignment_in.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.get("/{assignment_id}", response_model=TaskAssignmentResponse)
def get_task_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    assignment = db.query(TaskAssignment).filter(TaskAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return assignment


@router.put("/{assignment_id}", response_model=TaskAssignmentResponse)
def update_task_assignment(
    assignment_id: UUID,
    assignment_in: TaskAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    assignment = db.query(TaskAssignment).filter(TaskAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")

    update_data = assignment_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(assignment, key, value)

    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}")
def delete_task_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    assignment = db.query(TaskAssignment).filter(TaskAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Task unassigned successfully"}
