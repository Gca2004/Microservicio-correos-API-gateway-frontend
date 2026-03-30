from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth_router, usuarios_router

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️ No se pudo crear tablas: {e}")

app = FastAPI(title="API Principal - bd_correos", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(usuarios_router.router)

@app.get("/")
def inicio():
    return {"estado": "API Principal activa"}