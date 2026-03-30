# -*- coding: utf-8 -*-
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY         = os.getenv("SECRET_KEY")
ALGORITHM          = os.getenv("ALGORITHM", "HS256")
MINUTOS_EXPIRACION = int(os.getenv("MINUTOS_EXPIRACION", "60"))

contexto_clave = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashear_clave(clave: str) -> str:
    return contexto_clave.hash(clave)

def verificar_clave(clave_plana: str, clave_hash: str) -> bool:
    return contexto_clave.verify(clave_plana, clave_hash)

def crear_token(datos: dict) -> str:
    copia = datos.copy()
    expira = datetime.utcnow() + timedelta(minutes=MINUTOS_EXPIRACION)
    copia.update({"exp": expira})
    return jwt.encode(copia, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None