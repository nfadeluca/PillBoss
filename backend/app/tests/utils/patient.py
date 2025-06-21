from sqlmodel import Session

from app import crud
from app.models import Patient, PatientCreate
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_lower_string


def create_random_patient(db: Session) -> Patient:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    first_name = random_lower_string()
    last_name = random_lower_string()
    age = 30
    height_cm = 175.0
    weight_kg = 70.5
    patient_in = PatientCreate(
        first_name=first_name,
        last_name=last_name,
        age=age,
        height_cm=height_cm,
        weight_kg=weight_kg,
    )
    return crud.create_patient(session=db, patient_in=patient_in, owner_id=owner_id) 