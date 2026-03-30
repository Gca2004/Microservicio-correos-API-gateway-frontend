from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import obtener_db
from models import Usuario, RegistroCorreo
from schemas import UsuarioCrear, UsuarioEditar, UsuarioRespuesta, MensajeCorreo, RegistroCorreoRespuesta
from seguridad import hashear_clave, verificar_token
from correo import correo_personalizado
from datetime import date
from typing import List

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def calcular_edad(fecha_nacimiento: date) -> int:
    hoy = date.today()
    edad = hoy.year - fecha_nacimiento.year
    if (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day):
        edad -= 1
    return edad

def verificar_admin(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    token = authorization.split(" ")[1]
    datos = verificar_token(token)
    if not datos or datos.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Acceso solo para administradores")
    return datos

def verificar_usuario(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    token = authorization.split(" ")[1]
    datos = verificar_token(token)
    if not datos:
        raise HTTPException(status_code=401, detail="Sesión expirada")
    return datos

@router.get("/yo", response_model=UsuarioRespuesta)
def mi_perfil(db: Session = Depends(obtener_db), token_datos=Depends(verificar_usuario)):
    usuario = db.query(Usuario).filter(Usuario.correo == token_datos["sub"]).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario.edad = calcular_edad(usuario.fecha_nacimiento)
    return usuario

@router.get("/historial-correos", response_model=List[RegistroCorreoRespuesta])
def historial_correos(db: Session = Depends(obtener_db), _=Depends(verificar_admin)):
    return db.query(RegistroCorreo).order_by(RegistroCorreo.fecha_envio.desc()).all()

@router.get("/", response_model=List[UsuarioRespuesta])
def listar_usuarios(db: Session = Depends(obtener_db), _=Depends(verificar_admin)):
    usuarios = db.query(Usuario).all()
    for u in usuarios:
        u.edad = calcular_edad(u.fecha_nacimiento)
    return usuarios

@router.post("/enviar-correo")
def enviar_correo_usuario(datos: MensajeCorreo,
                          db: Session = Depends(obtener_db),
                          admin=Depends(verificar_admin)):
    resultados = []
    for correo_dest in datos.correos_destino:
        usuario = db.query(Usuario).filter(Usuario.correo == correo_dest).first()
        if not usuario:
            resultados.append({"correo": correo_dest, "estado": "fallido", "razon": "Usuario no encontrado"})
            continue
        estado = "enviado"
        try:
            correo_personalizado(usuario.nombres, usuario.correo, datos.asunto, datos.mensaje)
        except Exception:
            estado = "fallido"
        registro = RegistroCorreo(
            correo_destino = usuario.correo,
            nombre_destino = usuario.nombres,
            asunto         = datos.asunto,
            mensaje        = datos.mensaje,
            enviado_por    = admin["sub"],
            estado         = estado
        )
        db.add(registro)
        resultados.append({"correo": correo_dest, "estado": estado})
    db.commit()
    enviados = len([r for r in resultados if r["estado"] == "enviado"])
    return {
        "mensaje": f"Proceso completado. {enviados} de {len(datos.correos_destino)} correos enviados.",
        "detalle": resultados
    }

@router.post("/", status_code=201)
def crear_usuario(datos: UsuarioCrear, db: Session = Depends(obtener_db), _=Depends(verificar_admin)):
    if db.query(Usuario).filter(Usuario.correo == datos.correo).first():
        raise HTTPException(status_code=400, detail="El correo ya existe")
    nuevo = Usuario(
        nombres          = datos.nombres,
        correo           = datos.correo,
        clave_hash       = hashear_clave(datos.clave),
        fecha_nacimiento = datos.fecha_nacimiento,
        genero           = datos.genero,
        rol              = datos.rol
    )
    db.add(nuevo)
    db.commit()
    return {"mensaje": "Usuario creado"}

@router.put("/{usuario_id}")
def editar_usuario(usuario_id: int, datos: UsuarioEditar,
                   db: Session = Depends(obtener_db), _=Depends(verificar_admin)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(usuario, campo, valor)
    db.commit()
    return {"mensaje": "Usuario actualizado"}

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(obtener_db), _=Depends(verificar_admin)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado"}