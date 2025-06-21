import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    # Relationship with patients created/owned by the user
    patients: list["Patient"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties for patient records
class PatientBase(SQLModel):
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)
    age: int = Field(gt=0)
    height_cm: float = Field(gt=0, description="Height in centimeters")
    weight_kg: float = Field(gt=0, description="Weight in kilograms")


# Properties to receive on patient creation
class PatientCreate(PatientBase):
    pass


# Properties to receive on patient update (all optional)
class PatientUpdate(PatientBase):
    first_name: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore
    last_name: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore
    age: int | None = Field(default=None, gt=0)  # type: ignore
    height_cm: float | None = Field(default=None, gt=0)  # type: ignore
    weight_kg: float | None = Field(default=None, gt=0)  # type: ignore


# Database model, database table inferred from class name
class Patient(PatientBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="patients")


# Properties to return via API, id is always required
class PatientPublic(PatientBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class PatientsPublic(SQLModel):
    data: list[PatientPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
