import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Registro() {
  const navigate = useNavigate()
  const [forma, setForma] = useState({
    nombres: '', correo: '', clave: '', fecha_nacimiento: '', genero: ''
  })
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarCambio = (e) => setForma({ ...forma, [e.target.name]: e.target.value })

const manejarEnvio = async (e) => {
  e.preventDefault()
  setError('')
  setExito('')
  setCargando(true)
  try {
    await api.post('/auth/registro', forma)
    setExito('¡Registro exitoso! Redirigiendo...')
    setTimeout(() => navigate('/verificacion-pendiente', { state: { correo: forma.correo } }), 1500)
  } catch (err) {
    setError(err.response?.data?.detail || 'Error al registrarse')
  } finally {
    setCargando(false)
  }
}

  return (
    <div className="auth-fondo">
      <div className="auth-panel-izq">
        <div className="auth-logo">Jade<br />Platform</div>
        <div className="auth-deco-linea" />
        <p className="auth-subtitulo">
          Crea tu cuenta y únete a nuestra plataforma. Te enviaremos un mensaje de bienvenida a tu correo.
        </p>
      </div>

      <div className="auth-panel-der">
        <div className="auth-caja">
          <h2 className="auth-titulo">Crear cuenta</h2>
          <p className="auth-desc">Completa el formulario para registrarte</p>

          <form onSubmit={manejarEnvio}>
            <div className="form-grupo">
              <label className="form-etiqueta">Nombres completos</label>
              <input className="form-input" type="text" name="nombres"
                value={forma.nombres} onChange={manejarCambio}
                placeholder="Tu nombre completo" required />
            </div>

            <div className="form-grupo">
              <label className="form-etiqueta">Correo Gmail</label>
              <input className="form-input" type="email" name="correo"
                value={forma.correo} onChange={manejarCambio}
                placeholder="tucorreo@gmail.com" required />
            </div>

            <div className="form-grupo">
              <label className="form-etiqueta">Clave</label>
              <input className="form-input" type="password" name="clave"
                value={forma.clave} onChange={manejarCambio}
                placeholder="Mínimo 8 caracteres" required />
            </div>

            <div className="form-grupo">
              <label className="form-etiqueta">Fecha de nacimiento</label>
              <input className="form-input" type="date" name="fecha_nacimiento"
                value={forma.fecha_nacimiento} onChange={manejarCambio} required />
            </div>

            <div className="form-grupo">
              <label className="form-etiqueta">Género</label>
              <select className="form-input" name="genero"
                value={forma.genero} onChange={manejarCambio} required>
                <option value="">Selecciona una opción</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {error && <div className="msg-error">{error}</div>}
            {exito && <div className="msg-exito">{exito}</div>}

            <button className="btn-principal" type="submit" disabled={cargando}>
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login" className="auth-link">¿Ya tienes cuenta? Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
