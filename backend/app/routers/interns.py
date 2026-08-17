from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import Intern, User
from app.schemas import InternCreate, InternUpdate, InternResponse

router = APIRouter(prefix="/api/interns", tags=["interns"])


@router.get("", response_model=List[InternResponse])
def list_interns(
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Intern)
    if role:
        query = query.filter(Intern.role == role)
    if status:
        query = query.filter(Intern.status == status)
    if search:
        query = query.filter(
            (Intern.name.ilike(f"%{search}%")) | (Intern.email.ilike(f"%{search}%"))
        )
    return query.order_by(Intern.created_at.desc()).all()


@router.post("", response_model=InternResponse)
def create_intern(
    intern_in: InternCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(Intern).filter(Intern.email == intern_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Intern with this email already exists")

    db_intern = Intern(**intern_in.model_dump())
    db.add(db_intern)
    db.commit()
    db.refresh(db_intern)
    return db_intern


@router.get("/{intern_id}", response_model=InternResponse)
def get_intern(
    intern_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    intern = db.query(Intern).filter(Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    return intern


@router.put("/{intern_id}", response_model=InternResponse)
def update_intern(
    intern_id: UUID,
    intern_in: InternUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    intern = db.query(Intern).filter(Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")

    update_data = intern_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(intern, key, value)

    db.commit()
    db.refresh(intern)
    return intern


@router.delete("/{intern_id}")
def delete_intern(
    intern_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    intern = db.query(Intern).filter(Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    db.delete(intern)
    db.commit()
    return {"message": "Intern deleted successfully"}
