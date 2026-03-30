import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function PanelAdmin() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [tabActiva, setTabActiva] = useState('usuarios')
  const [usuarios, setUsuarios]   = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState('')
  const [seleccionados, setSeleccionados] = useState([])

  const [modalCrear,  setModalCrear]  = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalCorreo, setModalCorreo] = useState(false)
  const [usuarioSel,  setUsuarioSel]  = useState(null)

  const [formaCrear, setFormaCrear] = useState({
    nombres: '', correo: '', clave: '', fecha_nacimiento: '', genero: '', rol: 'cliente'
  })
  const [formaEditar, setFormaEditar] = useState({
    nombres: '', correo: '', fecha_nacimiento: '', genero: '', rol: '', activo: 1
  })
  const [formaCorreo, setFormaCorreo] = useState({
    correos_destino: [], asunto: '', mensaje: ''
  })

  const [msgCrear,  setMsgCrear]  = useState({ tipo: '', texto: '' })
  const [msgEditar, setMsgEditar] = useState({ tipo: '', texto: '' })
  const [msgCorreo, setMsgCorreo] = useState({ tipo: '', texto: '' })

  useEffect(() => { cargarUsuarios() }, [])

  const cargarUsuarios = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data)
    } catch {
      setError('No se pudieron cargar los usuarios')
    } finally {
      setCargando(false)
    }
  }

  const cargarHistorial = async () => {
    try {
      const res = await api.get('/usuarios/historial-correos')
      setHistorial(res.data)
    } catch {
      console.error('No se pudo cargar el historial')
    }
  }

  const manejarSalir = () => { cerrarSesion(); navigate('/login') }

  const toggleSeleccion = (correo) => {
    setSeleccionados(prev =>
      prev.includes(correo) ? prev.filter(c => c !== correo) : [...prev, correo]
    )
  }
  const seleccionarTodos = () => setSeleccionados(usuarios.map(u => u.correo))
  const limpiarSeleccion = () => setSeleccionados([])
  const todosSeleccionados = seleccionados.length === usuarios.length && usuarios.length > 0
  const algunoSeleccionado = seleccionados.length > 0

  const abrirCrear = () => {
    setFormaCrear({ nombres: '', correo: '', clave: '', fecha_nacimiento: '', genero: '', rol: 'cliente' })
    setMsgCrear({ tipo: '', texto: '' })
    setModalCrear(true)
  }

  const crearUsuario = async (e) => {
    e.preventDefault()
    setMsgCrear({ tipo: '', texto: '' })
    try {
      await api.post('/usuarios', formaCrear)
      setMsgCrear({ tipo: 'exito', texto: 'Usuario creado correctamente' })
      cargarUsuarios()
      setTimeout(() => setModalCrear(false), 1500)
    } catch (err) {
      const d = err.response?.data?.detail
      const texto = Array.isArray(d) ? d.map(e => e.msg).join(', ') : typeof d === 'string' ? d : 'Error al crear usuario'
      setMsgCrear({ tipo: 'error', texto })
    }
  }

  const abrirEditar = (u) => {
    setUsuarioSel(u)
    setFormaEditar({
      nombres: u.nombres, correo: u.correo,
      fecha_nacimiento: u.fecha_nacimiento,
      genero: u.genero, rol: u.rol, activo: u.activo
    })
    setMsgEditar({ tipo: '', texto: '' })
    setModalEditar(true)
  }

  const editarUsuario = async (e) => {
    e.preventDefault()
    setMsgEditar({ tipo: '', texto: '' })
    try {
      await api.put(`/usuarios/${usuarioSel.id}`, formaEditar)
      setMsgEditar({ tipo: 'exito', texto: 'Usuario actualizado correctamente' })
      cargarUsuarios()
      setTimeout(() => setModalEditar(false), 1500)
    } catch (err) {
      const d = err.response?.data?.detail
      const texto = Array.isArray(d) ? d.map(e => e.msg).join(', ') : typeof d === 'string' ? d : 'Error al editar'
      setMsgEditar({ tipo: 'error', texto })
    }
  }

  const eliminarUsuario = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return
    try {
      await api.delete(`/usuarios/${id}`)
      cargarUsuarios()
    } catch {
      alert('No se pudo eliminar el usuario')
    }
  }

  const abrirCorreoIndividual = (u) => {
    setFormaCorreo({ correos_destino: [u.correo], asunto: '', mensaje: '' })
    setMsgCorreo({ tipo: '', texto: '' })
    setModalCorreo(true)
  }

  const abrirCorreoMultiple = (destinos = seleccionados) => {
    setFormaCorreo({ correos_destino: destinos, asunto: '', mensaje: '' })
    setMsgCorreo({ tipo: '', texto: '' })
    setModalCorreo(true)
  }

  const quitarDestinatario = (correo) => {
    setFormaCorreo(prev => ({
      ...prev,
      correos_destino: prev.correos_destino.filter(c => c !== correo)
    }))
  }

  const enviarCorreo = async (e) => {
    e.preventDefault()
    setMsgCorreo({ tipo: '', texto: '' })
    try {
      const res = await api.post('/usuarios/enviar-correo', {
        correos_destino: formaCorreo.correos_destino,
        asunto:          formaCorreo.asunto,
        mensaje:         formaCorreo.mensaje
      })
      const texto = typeof res.data.mensaje === 'string'
        ? res.data.mensaje
        : JSON.stringify(res.data.mensaje)
      setMsgCorreo({ tipo: 'exito', texto })
      limpiarSeleccion()
      setTimeout(() => setModalCorreo(false), 2500)
    } catch (err) {
      const d = err.response?.data?.detail
      const texto = Array.isArray(d)
        ? d.map(e => e.msg).join(', ')
        : typeof d === 'string'
        ? d
        : 'Error al enviar el correo'
      setMsgCorreo({ tipo: 'error', texto })
    }
  }

  const totalUsuarios = usuarios.length
  const totalClientes = usuarios.filter(u => u.rol === 'cliente').length
  const totalAdmins   = usuarios.filter(u => u.rol === 'admin').length

  return (
    <div className="admin-layout">

      <nav className="navbar">
        <span className="navbar-logo">Panel de administración</span>
        <div className="navbar-usuario">
          <span className="navbar-nombre">Admin: {usuario?.nombres}</span>
          <button className="navbar-btn-salir" onClick={manejarSalir}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="admin-contenido">

        <div className="admin-encabezado">
          <h1 className="admin-titulo">Bienvenido, {usuario?.nombres}</h1>
          <p className="admin-subtitulo">Gestiona usuarios y comunicaciones de la plataforma</p>
        </div>

        <div className="stats-grid">
          <div className="stat-tarjeta">
            <div className="stat-valor">{totalUsuarios}</div>
            <div className="stat-label">Total usuarios</div>
          </div>
          <div className="stat-tarjeta" style={{ borderLeftColor: '#6C8480' }}>
            <div className="stat-valor">{totalClientes}</div>
            <div className="stat-label">Clientes</div>
          </div>
          <div className="stat-tarjeta" style={{ borderLeftColor: '#404E3B' }}>
            <div className="stat-valor">{totalAdmins}</div>
            <div className="stat-label">Administradores</div>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`tab ${tabActiva === 'usuarios' ? 'activo' : ''}`}
            onClick={() => setTabActiva('usuarios')}>
            👥 Usuarios
          </button>
          <button className={`tab ${tabActiva === 'correos' ? 'activo' : ''}`}
            onClick={() => setTabActiva('correos')}>
            ✉️ Enviar correo
          </button>
          <button className={`tab ${tabActiva === 'historial' ? 'activo' : ''}`}
            onClick={() => { setTabActiva('historial'); cargarHistorial() }}>
            📋 Historial
          </button>
        </div>

        {tabActiva === 'usuarios' && (
          <div className="panel-tarjeta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', paddingBottom: '0.8rem', borderBottom: '1.5px solid #E6E6E6' }}>
              <h3 className="panel-tarjeta-titulo" style={{ margin: 0, border: 'none', padding: 0 }}>
                Lista de usuarios
                {algunoSeleccionado && (
                  <span style={{ marginLeft: '0.8rem', fontSize: '0.8rem', color: 'var(--verde-azulado)', fontFamily: 'DM Sans,sans-serif', fontWeight: 400 }}>
                    — {seleccionados.length} seleccionado{seleccionados.length > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {algunoSeleccionado && (
                  <button className="btn-secundario" onClick={() => abrirCorreoMultiple()}>
                    ✉ Seleccionados ({seleccionados.length})
                  </button>
                )}
                <button className="btn-secundario" onClick={() => abrirCorreoMultiple(usuarios.map(u => u.correo))}>
                  ✉ Todos
                </button>
                <button className="btn-principal" style={{ width: 'auto', padding: '0.6rem 1.2rem' }} onClick={abrirCrear}>
                  + Nuevo usuario
                </button>
              </div>
            </div>

            {error && <div className="msg-error">{error}</div>}

            {cargando ? (
              <p style={{ color: 'var(--texto-suave)', textAlign: 'center', padding: '2rem' }}>Cargando usuarios...</p>
            ) : (
              <div className="tabla-contenedor">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox"
                          checked={todosSeleccionados}
                          onChange={e => e.target.checked ? seleccionarTodos() : limpiarSeleccion()}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                      </th>
                      <th>Nombres</th>
                      <th>Correo</th>
                      <th>Género</th>
                      <th>Fecha nac.</th>
                      <th>Edad</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id} style={{ background: seleccionados.includes(u.correo) ? 'rgba(123,150,105,0.08)' : '' }}>
                        <td>
                          <input type="checkbox"
                            checked={seleccionados.includes(u.correo)}
                            onChange={() => toggleSeleccion(u.correo)}
                            style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                          />
                        </td>
                        <td>{u.nombres}</td>
                        <td>{u.correo}</td>
                        <td style={{ textTransform: 'capitalize' }}>{u.genero}</td>
                        <td>{u.fecha_nacimiento}</td>
                        <td>{u.edad} años</td>
                        <td>
                          <span className={`badge-rol ${u.rol === 'admin' ? 'badge-admin' : 'badge-cliente'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: u.activo ? '#276749' : '#c0392b', fontSize: '0.82rem', fontWeight: 500 }}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="acciones">
                            <button className="btn-secundario btn-sm" onClick={() => abrirEditar(u)}>Editar</button>
                            <button className="btn-secundario btn-sm" onClick={() => abrirCorreoIndividual(u)}>✉</button>
                            <button className="btn-peligro btn-sm" onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usuarios.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-suave)' }}>No hay usuarios registrados</p>
                )}
              </div>
            )}
          </div>
        )}

        {tabActiva === 'correos' && (
          <div className="panel-tarjeta">
            <h3 className="panel-tarjeta-titulo">Enviar mensaje</h3>
            <p style={{ color: 'var(--texto-suave)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Selecciona los destinatarios haciendo clic en cada uno, luego redacta el mensaje.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                Destinatarios {algunoSeleccionado && `— ${seleccionados.length} seleccionado${seleccionados.length > 1 ? 's' : ''}`}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secundario btn-sm" onClick={seleccionarTodos}>Todos</button>
                <button className="btn-secundario btn-sm" onClick={limpiarSeleccion}>Limpiar</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {usuarios.map(u => (
                <div key={u.id} onClick={() => toggleSeleccion(u.correo)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer',
                    border: `1.5px solid ${seleccionados.includes(u.correo) ? 'var(--verde-principal)' : 'var(--gris-claro)'}`,
                    background: seleccionados.includes(u.correo) ? 'rgba(123,150,105,0.08)' : '#fafaf8',
                    transition: 'all 0.2s'
                  }}>
                  <input type="checkbox" readOnly
                    checked={seleccionados.includes(u.correo)}
                    style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, color: 'var(--texto)', fontSize: '0.92rem' }}>{u.nombres}</span>
                    <span style={{ color: 'var(--texto-suave)', fontSize: '0.82rem', marginLeft: '0.6rem' }}>{u.correo}</span>
                  </div>
                  <span className={`badge-rol ${u.rol === 'admin' ? 'badge-admin' : 'badge-cliente'}`}>{u.rol}</span>
                </div>
              ))}
            </div>

            {algunoSeleccionado ? (
              <button className="btn-principal" style={{ width: 'auto', padding: '0.75rem 2rem' }}
                onClick={() => abrirCorreoMultiple()}>
                ✉ Redactar para {seleccionados.length} destinatario{seleccionados.length > 1 ? 's' : ''}
              </button>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--texto-suave)', fontStyle: 'italic' }}>
                Selecciona al menos un destinatario para continuar.
              </p>
            )}
          </div>
        )}

        {tabActiva === 'historial' && (
          <div className="panel-tarjeta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', paddingBottom: '0.8rem', borderBottom: '1.5px solid #E6E6E6' }}>
              <h3 className="panel-tarjeta-titulo" style={{ margin: 0, border: 'none', padding: 0 }}>
                Historial de correos enviados
              </h3>
              <button className="btn-secundario btn-sm" onClick={cargarHistorial}>↻ Actualizar</button>
            </div>
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>Fecha y hora</th>
                    <th>Destinatario</th>
                    <th>Correo</th>
                    <th>Asunto</th>
                    <th>Enviado por</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--texto-suave)', whiteSpace: 'nowrap' }}>
                        {new Date(h.fecha_envio).toLocaleString('es-CO')}
                      </td>
                      <td>{h.nombre_destino}</td>
                      <td style={{ fontSize: '0.82rem' }}>{h.correo_destino}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.asunto}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>{h.enviado_por}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.7rem',
                          borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500,
                          background: h.estado === 'enviado' ? 'rgba(123,150,105,0.2)' : 'rgba(192,57,43,0.15)',
                          color: h.estado === 'enviado' ? 'var(--verde-principal)' : '#c0392b'
                        }}>
                          {h.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {historial.length === 0 && (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-suave)' }}>
                  No hay correos enviados aún
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {algunoSeleccionado && tabActiva === 'usuarios' && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: 'var(--verde-oscuro)', color: 'var(--verde-claro)',
          padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(64,78,59,0.35)',
          display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 150
        }}>
          <span style={{ fontSize: '0.88rem' }}>
            {seleccionados.length} usuario{seleccionados.length > 1 ? 's' : ''} seleccionado{seleccionados.length > 1 ? 's' : ''}
          </span>
          <button className="btn-secundario btn-sm"
            onClick={() => abrirCorreoMultiple()}
            style={{ borderColor: 'var(--verde-claro)', color: 'var(--verde-claro)' }}>
            ✉ Enviar correo
          </button>
          <button onClick={limpiarSeleccion}
            style={{ background: 'none', border: 'none', color: 'var(--verde-claro)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>
            ✕
          </button>
        </div>
      )}

      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal-caja" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setModalCrear(false)}>✕</button>
            <h3 className="modal-titulo">Nuevo usuario</h3>
            <form onSubmit={crearUsuario}>
              <div className="form-grid">
                <div className="form-grupo form-grid-full">
                  <label className="form-etiqueta">Nombres completos</label>
                  <input className="form-input" type="text"
                    value={formaCrear.nombres}
                    onChange={e => setFormaCrear({ ...formaCrear, nombres: e.target.value })}
                    placeholder="Nombre completo" required />
                </div>
                <div className="form-grupo form-grid-full">
                  <label className="form-etiqueta">Correo</label>
                  <input className="form-input" type="email"
                    value={formaCrear.correo}
                    onChange={e => setFormaCrear({ ...formaCrear, correo: e.target.value })}
                    placeholder="correo@gmail.com" required />
                </div>
                <div className="form-grupo form-grid-full">
                  <label className="form-etiqueta">Clave</label>
                  <input className="form-input" type="password"
                    value={formaCrear.clave}
                    onChange={e => setFormaCrear({ ...formaCrear, clave: e.target.value })}
                    placeholder="Mínimo 8 caracteres" required />
                </div>
                <div className="form-grupo">
                  <label className="form-etiqueta">Fecha de nacimiento</label>
                  <input className="form-input" type="date"
                    value={formaCrear.fecha_nacimiento}
                    onChange={e => setFormaCrear({ ...formaCrear, fecha_nacimiento: e.target.value })}
                    required />
                </div>
                <div className="form-grupo">
                  <label className="form-etiqueta">Género</label>
                  <select className="form-input"
                    value={formaCrear.genero}
                    onChange={e => setFormaCrear({ ...formaCrear, genero: e.target.value })} required>
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="form-grupo form-grid-full">
                  <label className="form-etiqueta">Rol</label>
                  <select className="form-input"
                    value={formaCrear.rol}
                    onChange={e => setFormaCrear({ ...formaCrear, rol: e.target.value })}>
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              {msgCrear.texto && (
                <div className={msgCrear.tipo === 'exito' ? 'msg-exito' : 'msg-error'}>{msgCrear.texto}</div>
              )}
              <div className="modal-acciones">
                <button type="button" className="btn-secundario" onClick={() => setModalCrear(false)}>Cancelar</button>
                <button type="submit" className="btn-principal" style={{ width: 'auto', padding: '0.7rem 1.8rem' }}>
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEditar && usuarioSel && (
        <div className="modal-overlay" onClick={() => setModalEditar(false)}>
          <div className="modal-caja" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setModalEditar(false)}>✕</button>
            <h3 className="modal-titulo">Editar usuario</h3>
            <form onSubmit={editarUsuario}>
              <div className="form-grid">
                <div className="form-grupo form-grid-full">
                  <label className="form-etiqueta">Nombres</label>
                  <input className="form-input" type="text"
                    value={formaEditar.nombres}
                    onChange={e => setFormaEditar({ ...formaEditar, nombres: e.target.value })} />
                </div>
                <div className="form-grupo form-grid-full">
                  <label className="form-etiqueta">Correo</label>
                  <input className="form-input" type="email"
                    value={formaEditar.correo}
                    onChange={e => setFormaEditar({ ...formaEditar, correo: e.target.value })} />
                </div>
                <div className="form-grupo">
                  <label className="form-etiqueta">Fecha de nacimiento</label>
                  <input className="form-input" type="date"
                    value={formaEditar.fecha_nacimiento}
                    onChange={e => setFormaEditar({ ...formaEditar, fecha_nacimiento: e.target.value })} />
                </div>
                <div className="form-grupo">
                  <label className="form-etiqueta">Género</label>
                  <select className="form-input"
                    value={formaEditar.genero}
                    onChange={e => setFormaEditar({ ...formaEditar, genero: e.target.value })}>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="form-grupo">
                  <label className="form-etiqueta">Rol</label>
                  <select className="form-input"
                    value={formaEditar.rol}
                    onChange={e => setFormaEditar({ ...formaEditar, rol: e.target.value })}>
                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="form-grupo">
                  <label className="form-etiqueta">Estado</label>
                  <select className="form-input"
                    value={formaEditar.activo}
                    onChange={e => setFormaEditar({ ...formaEditar, activo: parseInt(e.target.value) })}>
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>
              {msgEditar.texto && (
                <div className={msgEditar.tipo === 'exito' ? 'msg-exito' : 'msg-error'}>{msgEditar.texto}</div>
              )}
              <div className="modal-acciones">
                <button type="button" className="btn-secundario" onClick={() => setModalEditar(false)}>Cancelar</button>
                <button type="submit" className="btn-principal" style={{ width: 'auto', padding: '0.7rem 1.8rem' }}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalCorreo && (
        <div className="modal-overlay" onClick={() => setModalCorreo(false)}>
          <div className="modal-caja" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setModalCorreo(false)}>✕</button>
            <h3 className="modal-titulo">Redactar correo</h3>

            <div style={{ marginBottom: '1.2rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, marginBottom: '0.5rem' }}>
                Destinatarios ({formaCorreo.correos_destino.length})
              </p>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                maxHeight: '100px', overflowY: 'auto', padding: '0.6rem',
                background: '#f7f9f5', borderRadius: '8px', border: '1px solid var(--gris-claro)',
                minHeight: '42px'
              }}>
                {formaCorreo.correos_destino.map(correo => (
                  <span key={correo} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    background: 'var(--verde-claro)', color: 'var(--verde-oscuro)',
                    padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 500
                  }}>
                    {correo}
                    <span onClick={() => quitarDestinatario(correo)}
                      style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>×</span>
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={enviarCorreo}>
              <div className="form-grupo">
                <label className="form-etiqueta">Asunto</label>
                <input className="form-input" type="text"
                  value={formaCorreo.asunto}
                  onChange={e => setFormaCorreo({ ...formaCorreo, asunto: e.target.value })}
                  placeholder="Asunto del mensaje" required />
              </div>
              <div className="form-grupo">
                <label className="form-etiqueta">Mensaje</label>
                <textarea className="form-input" rows={5}
                  style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
                  value={formaCorreo.mensaje}
                  onChange={e => setFormaCorreo({ ...formaCorreo, mensaje: e.target.value })}
                  placeholder="Escribe tu mensaje aquí..." required />
              </div>
              {msgCorreo.texto && (
                <div className={msgCorreo.tipo === 'exito' ? 'msg-exito' : 'msg-error'}>{msgCorreo.texto}</div>
              )}
              <div className="modal-acciones">
                <button type="button" className="btn-secundario" onClick={() => setModalCorreo(false)}>Cancelar</button>
                <button type="submit" className="btn-principal"
                  style={{ width: 'auto', padding: '0.7rem 1.8rem' }}
                  disabled={formaCorreo.correos_destino.length === 0}>
                  Enviar a {formaCorreo.correos_destino.length} destinatario{formaCorreo.correos_destino.length > 1 ? 's' : ''}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
