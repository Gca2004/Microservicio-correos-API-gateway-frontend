import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function BienvenidaCliente() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const manejarSalir = () => {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <div className="bienvenida-fondo">
      <nav className="navbar">
        <span className="navbar-logo">Jade Platform</span>
        <div className="navbar-usuario">
          <span className="navbar-nombre">{usuario?.nombres}</span>
          <button className="navbar-btn-salir" onClick={manejarSalir}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="bienvenida-contenido">
        <div className="bienvenida-tarjeta">
          <div className="bienvenida-icono">🌿</div>

          <h1 className="bienvenida-titulo">
            ¡Bienvenido, {usuario?.nombres}!
          </h1>

          <span className="bienvenida-badge">Cliente activo</span>

          <p className="bienvenida-msg">
            Nos alegra tenerte en nuestra plataforma. Te hemos enviado un
            mensaje de bienvenida a tu correo. Si tienes alguna duda,
            no dudes en contactarnos.
          </p>

          <button className="bienvenida-btn-salir" onClick={manejarSalir}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
