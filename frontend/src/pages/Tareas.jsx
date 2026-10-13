import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/tasks.css';

function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const total = tareas.length;
  const completadas = tareas.filter((t) => t.completada).length;
  const pendientes = total - completadas;

  const cargarTareas = useCallback(async () => {
    try {
      const res = await axios.get('/tareas');
      setTareas(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        console.error('Error al cargar tareas:', error);
      }
    }
  }, [logout, navigate]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  const agregarTarea = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;
    setLoadingAdd(true);
    try {
      const res = await axios.post('/tareas', { titulo: nuevaTarea });
      setTareas([...tareas, res.data]);
      setNuevaTarea('');
    } catch (error) {
      console.error('Error al agregar tarea:', error);
    } finally {
      setLoadingAdd(false);
    }
  };

  const toggleCompletada = async (id, completada) => {
    setLoadingId(id);
    try {
      const res = await axios.put(`/tareas/${id}`, { completada: !completada });
      setTareas(tareas.map((t) => (t._id === id ? res.data : t)));
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const eliminarTarea = async (id) => {
    setLoadingId(id);
    try {
      await axios.delete(`/tareas/${id}`);
      setTareas(tareas.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const iniciarEdicion = (tarea) => {
    setEditingId(tarea._id);
    setEditingTitle(tarea.titulo);
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const guardarEdicion = async (id) => {
    if (!editingTitle.trim()) return;
    setLoadingId(id);
    try {
      const res = await axios.put(`/tareas/${id}`, { titulo: editingTitle.trim() });
      setTareas(tareas.map((t) => (t._id === id ? res.data : t)));
      cancelarEdicion();
    } catch (error) {
      console.error('Error al editar tarea:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      guardarEdicion(id);
    } else if (e.key === 'Escape') {
      cancelarEdicion();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Tareas visibles según filtro actual
  const tareasFiltradas = tareas.filter((t) => {
    if (filtro === 'pendientes') return !t.completada;
    if (filtro === 'completadas') return t.completada;
    return true;
  });

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <h1>Mis tareas</h1>
          <p className="tasks-subtitle">{user?.email}</p>
          {total > 0 && (
            <p className="tasks-counter">
              {pendientes} pendiente{pendientes !== 1 ? 's' : ''} · {completadas} completada{completadas !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Cerrar sesión
        </button>
      </header>

      <form onSubmit={agregarTarea} className="tasks-form">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Nueva tarea..."
          disabled={loadingAdd}
        />
        <button type="submit" className="btn btn-primary" disabled={loadingAdd}>
          {loadingAdd && <span className="spinner" />}
          {loadingAdd ? 'Agregando...' : 'Agregar'}
        </button>
      </form>

      {total > 0 && (
        <div className="tasks-filters">
          <button
            className={`filter-btn ${filtro === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltro('todas')}
          >
            Todas ({total})
          </button>
          <button
            className={`filter-btn ${filtro === 'pendientes' ? 'active' : ''}`}
            onClick={() => setFiltro('pendientes')}
          >
            Pendientes ({pendientes})
          </button>
          <button
            className={`filter-btn ${filtro === 'completadas' ? 'active' : ''}`}
            onClick={() => setFiltro('completadas')}
          >
            Completadas ({completadas})
          </button>
        </div>
      )}

      {total === 0 ? (
        <p className="tasks-empty">No tienes tareas todavía. Crea una arriba.</p>
      ) : tareasFiltradas.length === 0 ? (
        <p className="tasks-empty">
          {filtro === 'pendientes'
            ? 'No hay tareas pendientes. ¡Todo listo!'
            : 'No hay tareas completadas todavía.'}
        </p>
      ) : (
        <ul className="tasks-list">
          {tareasFiltradas.map((tarea) => {
            const enEdicion = editingId === tarea._id;
            const procesando = loadingId === tarea._id;

            return (
              <li key={tarea._id} className="task-item">
                {enEdicion ? (
                  <>
                    <input
                      type="text"
                      className="task-edit-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, tarea._id)}
                      autoFocus
                      disabled={procesando}
                    />
                    <div className="task-actions">
                      <button
                        onClick={() => guardarEdicion(tarea._id)}
                        className="btn btn-primary btn-sm"
                        disabled={procesando}
                      >
                        {procesando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="btn btn-secondary btn-sm"
                        disabled={procesando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      className={`task-title ${tarea.completada ? 'completed' : ''}`}
                      onClick={() => !procesando && toggleCompletada(tarea._id, tarea.completada)}
                    >
                      {tarea.titulo}
                    </span>
                    <div className="task-actions">
                      <button
                        onClick={() => iniciarEdicion(tarea)}
                        className="btn btn-secondary btn-sm"
                        disabled={procesando}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarTarea(tarea._id)}
                        className="btn btn-danger"
                        disabled={procesando}
                      >
                        {procesando ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Tareas;