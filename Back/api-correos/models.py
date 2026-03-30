from sqlalchemy import Column, Integer, String, Date, DateTime, Enum, SmallInteger
from sqlalchemy.sql import func
from database import Base
import enum

class RolEnum(str, enum.Enum):
    cliente = "cliente"
    admin   = "admin"

class GeneroEnum(str, enum.Enum):
    masculino = "masculino"
    femenino  = "femenino"
    otro      = "otro"

class Usuario(Base):
    __tablename__ = "usuarios"

    id                   = Column(Integer, primary_key=True, index=True)
    nombres              = Column(String(120), nullable=False)
    correo               = Column(String(150), unique=True, index=True, nullable=False)
    clave_hash           = Column(String(255), nullable=False)
    fecha_nacimiento     = Column(Date, nullable=False)
    genero               = Column(Enum(GeneroEnum), nullable=False)
    rol                  = Column(Enum(RolEnum), nullable=False, default=RolEnum.cliente)
    activo               = Column(SmallInteger, nullable=False, default=1)
    fecha_registro       = Column(DateTime, server_default=func.now())
    verificado           = Column(SmallInteger, nullable=False, default=0)
    codigo_verificacion  = Column(String(4), nullable=True)
    codigo_expira        = Column(DateTime, nullable=True)

class RegistroCorreo(Base):
    __tablename__ = "registro_correos"

    id             = Column(Integer, primary_key=True, index=True)
    correo_destino = Column(String(150), nullable=False)
    nombre_destino = Column(String(120), nullable=False)
    asunto         = Column(String(255), nullable=False)
    mensaje        = Column(String(5000), nullable=False)
    enviado_por    = Column(String(150), nullable=False)
    fecha_envio    = Column(DateTime, server_default=func.now())
    estado         = Column(Enum("enviado", "fallido", name="estado_correo"), nullable=False, default="enviado")