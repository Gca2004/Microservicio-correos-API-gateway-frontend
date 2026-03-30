from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import obtener_db
from models import Usuario
from schemas import UsuarioRegistro, LoginDatos, Token, CambioClave
from seguridad import hashear_clave, verificar_clave, crear_token
from correo import correo_bienvenida, correo_verificacion, correo_restablecer_clave
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/auth", tags=["Autenticación"])

def generar_codigo() -> str:
    return str(random.randint(1000, 9999))

@router.post("/registro", status_code=201)
def registrar(datos: UsuarioRegistro, db: Session = Depends(obtener_db)):
    if db.query(Usuario).filter(Usuario.correo == datos.correo).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    codigo = generar_codigo()
    expira = datetime.utcnow() + timedelta(minutes=15)

    nuevo = Usuario(
        nombres              = datos.nombres,
        correo               = datos.correo,
        clave_hash           = hashear_clave(datos.clave),
        fecha_nacimiento     = datos.fecha_nacimiento,
        genero               = datos.genero,
        rol                  = "cliente",
        verificado           = 0,
        codigo_verificacion  = codigo,
        codigo_expira        = expira
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    try:
        correo_verificacion(nuevo.nombres, nuevo.correo, codigo)
    except Exception:
        pass

    return {"mensaje": "Registro exitoso. Revisa tu correo e ingresa el código de verificación."}

@router.post("/verificar-codigo")
def verificar_codigo(correo: str, codigo: str, db: Session = Depends(obtener_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Correo no encontrado")
    if usuario.verificado:
        raise HTTPException(status_code=400, detail="La cuenta ya está verificada")
    if usuario.codigo_verificacion != codigo:
        raise HTTPException(status_code=400, detail="Código incorrecto")
    if datetime.utcnow() > usuario.codigo_expira:
        raise HTTPException(status_code=400, detail="El código ha expirado")

    usuario.verificado           = 1
    usuario.codigo_verificacion  = None
    usuario.codigo_expira        = None
    db.commit()

    try:
        correo_bienvenida(usuario.nombres, usuario.correo)
    except Exception:
        pass

    return {"mensaje": "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión."}

@router.post("/reenviar-codigo")
def reenviar_codigo(correo: str, db: Session = Depends(obtener_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Correo no encontrado")
    if usuario.verificado:
        raise HTTPException(status_code=400, detail="La cuenta ya está verificada")

    codigo = generar_codigo()
    expira = datetime.utcnow() + timedelta(minutes=15)
    usuario.codigo_verificacion = codigo
    usuario.codigo_expira       = expira
    db.commit()

    try:
        correo_verificacion(usuario.nombres, usuario.correo, codigo)
    except Exception:
        pass

    return {"mensaje": "Código reenviado. Revisa tu correo."}

@router.post("/login", response_model=Token)
def login(datos: LoginDatos, db: Session = Depends(obtener_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()

    if not usuario or not verificar_clave(datos.clave, usuario.clave_hash):
        raise HTTPException(status_code=401, detail="Correo o clave incorrectos")
    if not usuario.verificado:
        raise HTTPException(status_code=403, detail="Cuenta no verificada. Revisa tu correo e ingresa el código.")
    if not usuario.activo:
        raise HTTPException(status_code=403, detail="Cuenta desactivada")

    token = crear_token({"sub": usuario.correo, "rol": usuario.rol, "id": usuario.id})
    return Token(token_acceso=token, rol=usuario.rol, nombres=usuario.nombres)

@router.post("/cambiar-clave")
def cambiar_clave(datos: CambioClave, db: Session = Depends(obtener_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Correo no encontrado")

    usuario.clave_hash = hashear_clave(datos.clave_nueva)
    db.commit()

    try:
        correo_restablecer_clave(usuario.nombres, usuario.correo)
    except Exception:
        pass

    return {"mensaje": "Clave actualizada correctamente"}