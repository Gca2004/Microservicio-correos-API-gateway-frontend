import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'

export default function VerificacionPendiente() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const correo    = location.state?.correo || ''

  const [codigo,   setCodigo]   = useState('')
  const [error,    setError]    = useState('')
  const [exito,    setExito]    = useState('')
  const [cargando, setCargando] = useState(false)
  const [reenviando, setReenviando] = useState(false)

  const manejarVerificar = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    setCargando(true)
    try {
      await api.post(`/auth/verificar-codigo?correo=${encodeURIComponent(correo)}&codigo=${codigo}`)
      setExito('¡Cuenta verificada! Redirigiendo al login...')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Código incorrecto o expirado')
    } finally {
      setCargando(false)
    }
  }

  const manejarReenviar = async () => {
    setError('')
    setExito('')
    setReenviando(true)
    try {
      await api.post(`/auth/reenviar-codigo?correo=${encodeURIComponent(correo)}`)
      setExito('Código reenviado. Revisa tu correo.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al reenviar el código')
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div className="auth-fondo">
      <div className="auth-panel-izq">
        <div className="auth-logo">GCA<br />Platform</div>
        <div className="auth-deco-linea" />
        <p className="auth-subtitulo">
          Verifica tu correo para activar tu cuenta y comenzar a usar la plataforma.
        </p>
      </div>

      <div className="auth-panel-der">
        <div className="auth-caja">

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', background: '#e8ede5',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.8rem'
            }}>
              📧
            </div>
            <h2 className="auth-titulo" style={{ marginBottom: '0.4rem' }}>Verifica tu cuenta</h2>
            <p className="auth-desc" style={{ marginBottom: '0.3rem' }}>
              Ingresa el código de 4 dígitos que enviamos a
            </p>
            <p style={{ fontWeight: 500, color: 'var(--verde-oscuro)', fontSize: '0.92rem' }}>
              {correo}
            </p>
          </div>

          <form onSubmit={manejarVerificar}>
            <div className="form-grupo" style={{ marginBottom: '1.2rem' }}>
              <label className="form-etiqueta" style={{ textAlign: 'center', display: 'block' }}>
                Código de verificación
              </label>
              <input
                className="form-input"
                type="text"
                maxLength={4}
                value={codigo}
                onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                required
                style={{
                  textAlign: 'center',
                  fontSize: '2rem',
                  letterSpacing: '0.5rem',
                  fontWeight: '600',
                  padding: '0.8rem',
                  color: 'var(--verde-oscuro)'
                }}
              />
            </div>

            {error && <div className="msg-error">{error}</div>}
            {exito && <div className="msg-exito">{exito}</div>}

            <button className="btn-principal" type="submit" disabled={cargando || codigo.length !== 4}>
              {cargando ? 'Verificando...' : 'Verificar cuenta'}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--texto-suave)', marginBottom: '0.5rem' }}>
              ¿No te llegó el código?
            </p>
            <button
              onClick={manejarReenviar}
              disabled={reenviando}
              style={{
                background: 'none', border: 'none',
                color: 'var(--verde-azulado)', fontSize: '0.88rem',
                cursor: 'pointer', textDecoration: 'underline'
              }}>
              {reenviando ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
