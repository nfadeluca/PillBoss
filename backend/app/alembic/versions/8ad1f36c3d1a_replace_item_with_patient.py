"""Replace Item with Patient

Revision ID: 8ad1f36c3d1a
Revises: 1a31ce608336
Create Date: 2025-06-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '8ad1f36c3d1a'
down_revision = '1a31ce608336'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the old item table if it exists
    op.drop_table('item')

    # Ensure uuid-ossp extension exists (required for uuid generation in Postgres)
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create the patient table
    op.create_table(
        'patient',
        sa.Column('first_name', sa.String(length=255), nullable=False),
        sa.Column('last_name', sa.String(length=255), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('height_cm', sa.Float(), nullable=False),
        sa.Column('weight_kg', sa.Float(), nullable=False),
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
    )


def downgrade():
    # Drop patient table
    op.drop_table('patient')

    # Recreate the item table (minimal definition to satisfy downgrades)
    op.create_table(
        'item',
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
    ) 