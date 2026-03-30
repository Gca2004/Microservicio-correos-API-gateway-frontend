import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children, rolRequerido }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div className="cargando">Cargando...</div>
  if (!usuario) return <Navigate to="/login" replace />
  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/bienvenida'} replace />
  }
  return children
}
