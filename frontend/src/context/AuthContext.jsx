import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token   = localStorage.getItem('token')
    const rol     = localStorage.getItem('rol')
    const nombres = localStorage.getItem('nombres')
    if (token && rol && nombres) setUsuario({ token, rol, nombres })
    setCargando(false)
  }, [])

  const iniciarSesion = (datos) => {
    localStorage.setItem('token',   datos.token_acceso)
    localStorage.setItem('rol',     datos.rol)
    localStorage.setItem('nombres', datos.nombres)
    setUsuario({ token: datos.token_acceso, rol: datos.rol, nombres: datos.nombres })
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('nombres')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
