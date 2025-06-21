"""Add Medication table and seed data

Revision ID: 9b2f1c4a5d7e
Revises: 8ad1f36c3d1a
Create Date: 2025-06-21 00:10:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '9b2f1c4a5d7e'
down_revision = '8ad1f36c3d1a'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        'medication',
        sa.Column('brand_name', sa.String(length=255), nullable=False),
        sa.Column('generic', sa.String(length=255), nullable=False),
        sa.Column('dose_mg', sa.Integer(), nullable=False),
        sa.Column('cost_usd', sa.Float(), nullable=False),
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
    )

    # seed medications (assuming owner is first superuser)
    op.execute(
        """
        INSERT INTO medication (id, brand_name, generic, dose_mg, cost_usd, owner_id)
        SELECT uuid_generate_v4(), data.brand, data.generic, data.dose, data.cost, u.id
        FROM (
            VALUES
                ('Tylenol', 'Acetaminophen', 500, 8.99),
                ('Advil', 'Ibuprofen', 200, 7.49),
                ('Lipitor', 'Atorvastatin', 40, 129.99),
                ('Zoloft', 'Sertraline', 50, 24.99),
                ('Glucophage', 'Metformin', 500, 12.5)
        ) AS data(brand, generic, dose, cost),
        (SELECT id FROM "user" LIMIT 1) AS u;
        """
    )


def downgrade():
    op.drop_table('medication') 