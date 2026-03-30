from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

API_PRINCIPAL_URL = os.getenv("API_PRINCIPAL_URL", "http://localhost:8001")

app = FastAPI(title="API Gateway", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cliente_http = httpx.AsyncClient(base_url=API_PRINCIPAL_URL, timeout=30.0)

# Headers CORS que no deben pasarse al cliente para evitar duplicados
HEADERS_EXCLUIR = {
    "host", "content-length", "transfer-encoding",
    "access-control-allow-origin",
    "access-control-allow-credentials",
    "access-control-allow-methods",
    "access-control-allow-headers",
}

async def reenviar(request: Request, ruta: str) -> Response:
    try:
        cuerpo = await request.body()
    except Exception:
        cuerpo = b""

    headers_salida = {
        clave: valor
        for clave, valor in request.headers.items()
        if clave.lower() != "host"
    }

    try:
        respuesta = await cliente_http.request(
            method  = request.method,
            url     = ruta,
            headers = headers_salida,
            content = cuerpo,
            params  = dict(request.query_params),
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="No se puede conectar con la API Principal."
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="La API Principal tardó demasiado en responder."
        )

    # Filtrar headers de respuesta para evitar duplicar los CORS
    headers_respuesta = {
        clave: valor
        for clave, valor in respuesta.headers.items()
        if clave.lower() not in HEADERS_EXCLUIR
    }

    return Response(
        content    = respuesta.content,
        status_code= respuesta.status_code,
        headers    = headers_respuesta,
        media_type = respuesta.headers.get("content-type"),
    )

# ── Autenticación ─────────────────────────────────────
@app.post("/auth/registro")
async def registro(request: Request):
    return await reenviar(request, "/auth/registro")

@app.post("/auth/login")
async def login(request: Request):
    return await reenviar(request, "/auth/login")

@app.post("/auth/cambiar-clave")
async def cambiar_clave(request: Request):
    return await reenviar(request, "/auth/cambiar-clave")

@app.post("/auth/verificar-codigo")
async def verificar_codigo(request: Request):
    return await reenviar(request, "/auth/verificar-codigo")

@app.post("/auth/reenviar-codigo")
async def reenviar_codigo(request: Request):
    return await reenviar(request, "/auth/reenviar-codigo")

# ── Usuarios ──────────────────────────────────────────
@app.get("/usuarios/yo")
async def mi_perfil(request: Request):
    return await reenviar(request, "/usuarios/yo")

@app.get("/usuarios/historial-correos")
async def historial_correos(request: Request):
    return await reenviar(request, "/usuarios/historial-correos")

@app.get("/usuarios")
async def listar_usuarios(request: Request):
    return await reenviar(request, "/usuarios/")

@app.post("/usuarios")
async def crear_usuario(request: Request):
    return await reenviar(request, "/usuarios/")

@app.put("/usuarios/{usuario_id}")
async def editar_usuario(usuario_id: int, request: Request):
    return await reenviar(request, f"/usuarios/{usuario_id}")

@app.delete("/usuarios/{usuario_id}")
async def eliminar_usuario(usuario_id: int, request: Request):
    return await reenviar(request, f"/usuarios/{usuario_id}")

@app.post("/usuarios/enviar-correo")
async def enviar_correo(request: Request):
    return await reenviar(request, "/usuarios/enviar-correo")

# ── Estado ────────────────────────────────────────────
@app.get("/")
async def estado():
    return {"estado": "API Gateway activa", "puerto": 8000}

@app.on_event("shutdown")
async def apagar():
    await cliente_http.aclose()