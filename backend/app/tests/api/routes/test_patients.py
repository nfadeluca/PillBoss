import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.patient import create_random_patient


def test_create_patient(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "age": 40,
        "height_cm": 180.0,
        "weight_kg": 80.0,
    }
    response = client.post(
        f"{settings.API_V1_STR}/patients/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    for key in data:
        assert content[key] == data[key]
    assert "id" in content
    assert "owner_id" in content


def test_read_patient(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    patient = create_random_patient(db)
    response = client.get(
        f"{settings.API_V1_STR}/patients/{patient.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["first_name"] == patient.first_name
    assert content["last_name"] == patient.last_name
    assert content["id"] == str(patient.id)
    assert content["owner_id"] == str(patient.owner_id)


def test_read_patient_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/patients/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Patient not found"


def test_read_patient_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    patient = create_random_patient(db)
    response = client.get(
        f"{settings.API_V1_STR}/patients/{patient.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_patients(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_patient(db)
    create_random_patient(db)
    response = client.get(
        f"{settings.API_V1_STR}/patients/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2


def test_update_patient(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    patient = create_random_patient(db)
    data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "age": 35,
        "height_cm": 165.0,
        "weight_kg": 60.0,
    }
    response = client.put(
        f"{settings.API_V1_STR}/patients/{patient.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    for key in data:
        assert content[key] == data[key]
    assert content["id"] == str(patient.id)
    assert content["owner_id"] == str(patient.owner_id)


def test_update_patient_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "age": 35,
        "height_cm": 165.0,
        "weight_kg": 60.0,
    }
    response = client.put(
        f"{settings.API_V1_STR}/patients/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Patient not found"


def test_update_patient_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    patient = create_random_patient(db)
    data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "age": 35,
        "height_cm": 165.0,
        "weight_kg": 60.0,
    }
    response = client.put(
        f"{settings.API_V1_STR}/patients/{patient.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_patient(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    patient = create_random_patient(db)
    response = client.delete(
        f"{settings.API_V1_STR}/patients/{patient.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Patient deleted successfully"


def test_delete_patient_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/patients/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Patient not found"


def test_delete_patient_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    patient = create_random_patient(db)
    response = client.delete(
        f"{settings.API_V1_STR}/patients/{patient.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions" 