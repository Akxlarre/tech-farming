"""Primera migración con modelos

Revision ID: b1277685d1bc
Revises: 
Create Date: 2025-03-26 22:14:03.147780

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b1277685d1bc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tipos_sensor',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=50), nullable=True),
    sa.Column('unidad', sa.String(length=20), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('usuarios',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=True),
    sa.Column('correo', sa.String(length=100), nullable=True),
    sa.Column('contraseña_hash', sa.String(length=128), nullable=True),
    sa.Column('rol', sa.String(length=50), nullable=True),
    sa.Column('fecha_creacion', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('correo')
    )
    op.create_table('invernaderos',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=True),
    sa.Column('ubicacion_texto', sa.String(length=150), nullable=True),
    sa.Column('latitud', sa.Numeric(), nullable=True),
    sa.Column('longitud', sa.Numeric(), nullable=True),
    sa.Column('descripcion', sa.Text(), nullable=True),
    sa.Column('fecha_registro', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sensores',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('invernadero_id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=True),
    sa.Column('descripcion', sa.Text(), nullable=True),
    sa.Column('estado', sa.Boolean(), nullable=True),
    sa.Column('fecha_instalacion', sa.Date(), nullable=True),
    sa.Column('pos_x', sa.Integer(), nullable=True),
    sa.Column('pos_y', sa.Integer(), nullable=True),
    sa.Column('zona', sa.String(length=50), nullable=True),
    sa.ForeignKeyConstraint(['invernadero_id'], ['invernaderos.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sensor_parametros',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sensor_id', sa.Integer(), nullable=False),
    sa.Column('tipo_sensor_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['sensor_id'], ['sensores.id'], ),
    sa.ForeignKeyConstraint(['tipo_sensor_id'], ['tipos_sensor.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('alertas',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sensor_parametro_id', sa.Integer(), nullable=False),
    sa.Column('tipo', sa.String(length=50), nullable=True),
    sa.Column('mensaje', sa.Text(), nullable=True),
    sa.Column('valor_detectado', sa.Numeric(), nullable=True),
    sa.Column('fecha_hora', sa.DateTime(), nullable=True),
    sa.Column('nivel', sa.String(length=20), nullable=True),
    sa.ForeignKeyConstraint(['sensor_parametro_id'], ['sensor_parametros.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('umbrales',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sensor_parametro_id', sa.Integer(), nullable=False),
    sa.Column('umbral_min', sa.Numeric(), nullable=True),
    sa.Column('umbral_max', sa.Numeric(), nullable=True),
    sa.Column('creado_en', sa.DateTime(), nullable=True),
    sa.Column('activo', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['sensor_parametro_id'], ['sensor_parametros.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('umbrales')
    op.drop_table('alertas')
    op.drop_table('sensor_parametros')
    op.drop_table('sensores')
    op.drop_table('invernaderos')
    op.drop_table('usuarios')
    op.drop_table('tipos_sensor')
    # ### end Alembic commands ###
