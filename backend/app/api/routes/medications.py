import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Medication,
    MedicationCreate,
    MedicationPublic,
    MedicationsPublic,
    MedicationUpdate,
    Message,
)

router = APIRouter(prefix="/medications", tags=["medications"])


@router.get("/", response_model=MedicationsPublic)
def read_medications(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """Retrieve medications."""

    # Return all medications irrespective of owner
    count_statement = select(func.count()).select_from(Medication)
    count = session.exec(count_statement).one()
    statement = select(Medication).offset(skip).limit(limit)
    meds = session.exec(statement).all()
    return MedicationsPublic(data=meds, count=count)


@router.get("/{id}", response_model=MedicationPublic)
def read_medication(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """Get medication by ID."""
    med = session.get(Medication, id)
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    return med


@router.post("/", response_model=MedicationPublic)
def create_medication(
    *, session: SessionDep, current_user: CurrentUser, medication_in: MedicationCreate
) -> Any:
    """Create new medication."""
    # Medication is not tied to any specific user
    med = Medication.model_validate(medication_in)
    session.add(med)
    session.commit()
    session.refresh(med)
    return med


@router.put("/{id}", response_model=MedicationPublic)
def update_medication(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    medication_in: MedicationUpdate,
) -> Any:
    """Update a medication."""
    med = session.get(Medication, id)
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    med.sqlmodel_update(medication_in.model_dump(exclude_unset=True))
    session.add(med)
    session.commit()
    session.refresh(med)
    return med


@router.delete("/{id}")
def delete_medication(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """Delete a medication."""
    med = session.get(Medication, id)
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    session.delete(med)
    session.commit()
    return Message(message="Medication deleted successfully") 