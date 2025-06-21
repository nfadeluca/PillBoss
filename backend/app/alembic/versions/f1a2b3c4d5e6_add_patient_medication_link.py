"""Add patient_medication_link table

Revision ID: f1a2b3c4d5e6
Revises: 9b2f1c4a5d7e
Create Date: 2025-06-21 02:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'f1a2b3c4d5e6'
down_revision = '9b2f1c4a5d7e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'patient_medication_link',
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('medication_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patient.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['medication_id'], ['medication.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('patient_id', 'medication_id'),
    )


def downgrade():
    op.drop_table('patient_medication_link') 