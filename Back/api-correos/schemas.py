# -*- coding: utf-8 -*-
from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional
from enum import Enum

class RolEnum(str, Enum):
    cliente = "cliente"
    admin   = "admin"

class GeneroEnum(str, Enum):
    masculino = "masculino"
    femenino  = "femenino"
    otro      = "otro"

class UsuarioRegistro(BaseModel):
    nombres:          str
    correo:           EmailStr
    clave:            str
    fecha_nacimiento: date
    genero:           GeneroEnum

    @field_validator("clave")
    @classmethod
    def clave_segura(cls, v):
        if len(v) < 8:
            raise ValueError("La clave debe tener minimo 8 caracteres")
        return v

class UsuarioCrear(UsuarioRegistro):
    rol: RolEnum = RolEnum.cliente

class UsuarioEditar(BaseModel):
    nombres:          Optional[str]         = None
    correo:           Optional[EmailStr]    = None
    fecha_nacimiento: Optional[date]        = None
    genero:           Optional[GeneroEnum]  = None
    rol:              Optional[RolEnum]     = None
    activo:           Optional[int]         = None

class UsuarioRespuesta(BaseModel):
    id:               int
    nombres:          str
    correo:           str
    fecha_nacimiento: date
    genero:           GeneroEnum
    rol:              RolEnum
    activo:           int
    fecha_registro:   datetime
    edad:             int

    class Config:
        from_attributes = True

class LoginDatos(BaseModel):
    correo: EmailStr
    clave:  str

class Token(BaseModel):
    token_acceso: str
    tipo_token:   str = "bearer"
    rol:          str
    nombres:      str

class CambioClave(BaseModel):
    correo:      EmailStr
    clave_nueva: str

class MensajeCorreo(BaseModel):
    correos_destino: list[str]
    asunto:          str
    mensaje:         str

class RegistroCorreoRespuesta(BaseModel):
    id:             int
    correo_destino: str
    nombre_destino: str
    asunto:         str
    mensaje:        str
    enviado_por:    str
    fecha_envio:    datetime
    estado:         str

    class Config:
        from_attributes = True
