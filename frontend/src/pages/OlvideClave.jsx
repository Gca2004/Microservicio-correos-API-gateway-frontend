import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function OlvideClave() {
  const [forma, setForma] = useState({ correo: '', clave_nueva: '' })
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
      await api.post('/auth/cambiar-clave', forma)
      setExito('¡Clave actualizada! Ya puedes iniciar sesión con tu nueva clave.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo no encontrado')
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
          Restablece tu clave de acceso ingresando tu correo registrado.
        </p>
      </div>

      <div className="auth-panel-der">
        <div className="auth-caja">
          <h2 className="auth-titulo">Restablecer clave</h2>
          <p className="auth-desc">Ingresa tu correo y elige una nueva clave</p>

          <form onSubmit={manejarEnvio}>
            <div className="form-grupo">
              <label className="form-etiqueta">Correo registrado</label>
              <input className="form-input" type="email" name="correo"
                value={forma.correo} onChange={manejarCambio}
                placeholder="tucorreo@gmail.com" required />
            </div>

            <div className="form-grupo">
              <label className="form-etiqueta">Nueva clave</label>
              <input className="form-input" type="password" name="clave_nueva"
                value={forma.clave_nueva} onChange={manejarCambio}
                placeholder="Mínimo 8 caracteres" required />
            </div>

            {error && <div className="msg-error">{error}</div>}
            {exito && <div className="msg-exito">{exito}</div>}

            <button className="btn-principal" type="submit" disabled={cargando}>
              {cargando ? 'Actualizando...' : 'Actualizar clave'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login" className="auth-link">← Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
