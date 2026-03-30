import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()
  const [forma, setForma] = useState({ correo: '', clave: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarCambio = (e) => setForma({ ...forma, [e.target.name]: e.target.value })

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await api.post('/auth/login', { correo: forma.correo, clave: forma.clave })
      iniciarSesion(res.data)
      navigate(res.data.rol === 'admin' ? '/admin' : '/bienvenida')
    } catch (err) {
      const detalle = err.response?.data?.detail || 'Error al iniciar sesión'
      if (err.response?.status === 403 && detalle.includes('verificada')) {
        setError('Tu cuenta no está verificada. Revisa tu correo e ingresa el código.')
      } else {
        setError(detalle)
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-fondo">
      <div className="auth-panel-izq">
        <div className="auth-logo">GCA<br />Platform</div>
        <div className="auth-deco-linea" />
        <p className="auth-subtitulo">
          Prueba MS de correos :)
        </p>
      </div>

      <div className="auth-panel-der">
        <div className="auth-caja">
          <h2 className="auth-titulo">Bienvenido</h2>
          <p className="auth-desc">Ingresa tus datos para continuar</p>

          <form onSubmit={manejarEnvio}>
            <div className="form-grupo">
              <label className="form-etiqueta">Correo</label>
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

            {error && <div className="msg-error">{error}</div>}

            <button className="btn-principal" type="submit" disabled={cargando}>
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/registro" className="auth-link">¿No tienes cuenta? Regístrate</Link>
            <Link to="/olvide-clave" className="auth-link">¿Olvidaste tu clave?</Link>
          </div>
        </div>
      </div>
    </div>
  )
}