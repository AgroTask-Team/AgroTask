import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import newTaskIcon from '../../assets/icons/NovaTarefa.svg';
import filtersIcon from '../../assets/icons/Filtros.svg';
import tableSortIcon from '../../assets/icons/TRPSP.svg';
import AppShell from '../../components/AppShell/AppShell';
import './Tasks.css';

function Tasks() {
  const navigate = useNavigate();
  const storedMembership = JSON.parse(
    localStorage.getItem('agrotask_membership') || '{}'
  );

  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const isAdmin = storedMembership.role === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('agrotask_token');
    localStorage.removeItem('agrotask_user');
    localStorage.removeItem('agrotask_farm');
    localStorage.removeItem('agrotask_membership');
    navigate('/', { replace: true });
  };

  const clearFilters = () => {
    setSearchValue('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.get('/tasks', {
        params: {
          search: searchValue,
          status: statusFilter,
          priority: priorityFilter,
        },
      });

      setTasks(response.data.tasks || []);
      setTotalTasks(response.data.total || 0);
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        'Não foi possível carregar as tarefas.';

      if (status === 401) {
        handleLogout();
        return;
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [searchValue, statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setTaskToDelete(null);
      }
    };

    if (taskToDelete) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [taskToDelete]);

  const handleOpenDeleteModal = (event, task) => {
    event.stopPropagation();
    setTaskToDelete(task);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCloseDeleteModal = () => {
    if (deletingTaskId) {
      return;
    }

    setTaskToDelete(null);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) {
      return;
    }

    try {
      setDeletingTaskId(taskToDelete.id);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await api.delete(`/tasks/${taskToDelete.id}`);

      setSuccessMessage(
        response.data.message || 'Tarefa excluída com sucesso.'
      );
      setTaskToDelete(null);

      await loadTasks();
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        'Não foi possível excluir a tarefa.';

      if (status === 401) {
        handleLogout();
        return;
      }

      setErrorMessage(message);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const hasActiveFilters = Boolean(
    searchValue.trim() || statusFilter || priorityFilter
  );

  const filteredTasksText = useMemo(() => {
    if (loading) {
      return 'Carregando tarefas...';
    }

    if (hasActiveFilters) {
      return `${totalTasks} tarefa(s) encontrada(s) com os filtros aplicados`;
    }

    return `${totalTasks} tarefas encontradas`;
  }, [loading, totalTasks, hasActiveFilters]);

  return (
    <AppShell title="Tarefas" pageClassName="tasks-page">
      <div className="tasks-shell">
        <div className="tasks-header-block">
          <div className="tasks-title-group">
            <h2>Tarefas</h2>
            <p>{filteredTasksText}</p>
          </div>

          {isAdmin && (
            <Link to="/new-task" className="tasks-new-button">
              <img src={newTaskIcon} alt="" className="tasks-new-button-icon" />
              <span>Nova tarefa</span>
            </Link>
          )}
        </div>

        <section className="tasks-filters-card">
          <div className="tasks-search-row">
            <div className="tasks-search-box">
              <span className="tasks-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Buscar por título, responsável ou área..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>

            <button
              type="button"
              className={`tasks-filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <img
                src={filtersIcon}
                alt=""
                className="tasks-filter-toggle-icon"
              />
              <span>Filtros</span>
            </button>
          </div>

          {showFilters && (
            <div className="tasks-expanded-filters">
              <div className="tasks-filter-field">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  className="tasks-filter-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="COMPLETED">Concluída</option>
                  <option value="LATE">Atrasada</option>
                </select>
              </div>

              <div className="tasks-filter-field">
                <label htmlFor="priority">Prioridade:</label>
                <select
                  id="priority"
                  className="tasks-filter-select"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>

              <button
                type="button"
                className="tasks-clear-filters"
                onClick={clearFilters}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        {errorMessage && (
          <div className="tasks-feedback error">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="tasks-feedback success">{successMessage}</div>
        )}

        <section className="tasks-table-card">
          <div
            className={`tasks-table-header ${isAdmin ? 'with-actions' : ''}`}
          >
            <div className="tasks-col title">
              <span>Título</span>
              <img src={tableSortIcon} alt="" className="tasks-sort-icon" />
            </div>

            <div className="tasks-col responsible">
              <span>Responsável</span>
              <img src={tableSortIcon} alt="" className="tasks-sort-icon" />
            </div>

            <div className="tasks-col priority">
              <span>Prioridade</span>
              <img src={tableSortIcon} alt="" className="tasks-sort-icon" />
            </div>

            <div className="tasks-col status">
              <span>Status</span>
              <img src={tableSortIcon} alt="" className="tasks-sort-icon" />
            </div>

            <div className="tasks-col deadline">
              <span>Prazo</span>
              <img src={tableSortIcon} alt="" className="tasks-sort-icon" />
            </div>

            {isAdmin && (
              <div className="tasks-col actions">
                <span>Ações</span>
              </div>
            )}
          </div>

          <div className="tasks-table-body">
            {loading && (
              <div className="tasks-empty-message">Carregando tarefas...</div>
            )}

            {!loading && tasks.length === 0 && (
              <div className="tasks-empty-message">
                Nenhuma tarefa encontrada.
              </div>
            )}

            {!loading &&
              tasks.map((task) => (
                <article
                  className={`tasks-row ${isAdmin ? 'with-actions' : ''}`}
                  key={task.id}
                  onClick={() => navigate(`/task-details/${task.id}`)}
                >
                  <div className="tasks-col title">
                    <div className="tasks-title-cell">
                      <strong>{task.title}</strong>
                      <span>{task.area}</span>
                    </div>
                  </div>

                  <div className="tasks-col responsible">
                    <div className="tasks-responsible-cell">
                      <div className="tasks-responsible-avatar">
                        {task.initials}
                      </div>
                      <span>{task.responsible}</span>
                    </div>
                  </div>

                  <div className="tasks-col priority">
                    <span className={`tasks-pill priority ${task.priorityClass}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="tasks-col status">
                    <span className={`tasks-pill status ${task.statusClass}`}>
                      <span className="tasks-status-dot" />
                      {task.status}
                    </span>
                  </div>

                  <div className="tasks-col deadline">
                    <span
                      className={`tasks-deadline ${
                        task.deadlineHighlight ? 'highlight' : ''
                      }`}
                    >
                      {task.deadline}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="tasks-col actions">
                      <button
                        type="button"
                        className="tasks-delete-button"
                        onClick={(event) => handleOpenDeleteModal(event, task)}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </article>
              ))}
          </div>

          <div className="tasks-table-footer">
            {loading
              ? 'Exibindo 0 de 0 tarefas'
              : `Exibindo ${tasks.length} de ${totalTasks} tarefas`}
          </div>
        </section>
      </div>

      {taskToDelete && (
        <div
          className="tasks-modal-overlay"
          onClick={handleCloseDeleteModal}
        >
          <div
            className="tasks-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tasks-modal-header">
              <h3>Excluir tarefa</h3>
            </div>

            <div className="tasks-modal-body">
              <p>
                Tem certeza que deseja excluir a tarefa{' '}
                <strong>{taskToDelete.title}</strong>?
              </p>
              <span>
                Essa ação também remove evidências e histórico vinculados.
              </span>
            </div>

            <div className="tasks-modal-actions">
              <button
                type="button"
                className="tasks-modal-cancel"
                onClick={handleCloseDeleteModal}
                disabled={Boolean(deletingTaskId)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="tasks-modal-confirm"
                onClick={handleConfirmDeleteTask}
                disabled={deletingTaskId === taskToDelete.id}
              >
                {deletingTaskId === taskToDelete.id
                  ? 'Excluindo...'
                  : 'Excluir tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default Tasks;