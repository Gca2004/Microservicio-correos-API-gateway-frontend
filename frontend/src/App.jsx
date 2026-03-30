import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Login from './pages/Login'
import Registro from './pages/Registro'
import OlvideClave from './pages/OlvideClave'
import BienvenidaCliente from './pages/BienvenidaCliente'
import PanelAdmin from './pages/admin/PanelAdmin'
import VerificacionPendiente from './pages/VerificacionPendiente'


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<Navigate to="/login" replace />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/registro"     element={<Registro />} />
          <Route path="/olvide-clave" element={<OlvideClave />} />
          <Route path="/verificacion-pendiente" element={<VerificacionPendiente />} />
          <Route path="/bienvenida"   element={
            <RutaProtegida rolRequerido="cliente"><BienvenidaCliente /></RutaProtegida>
          } />
          <Route path="/admin"        element={
            <RutaProtegida rolRequerido="admin"><PanelAdmin /></RutaProtegida>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
