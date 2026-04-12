import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import backIcon from '../../assets/icons/Voltar.svg';
import saveChangesIcon from '../../assets/icons/SalvarAlterações.svg';
import AppShell from '../../components/AppShell/AppShell';
import './EditTask.css';

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedMembership = JSON.parse(
    localStorage.getItem('agrotask_membership') || '{}'
  );

  const isAdmin = storedMembership.role === 'ADMIN';

  const [users, setUsers] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    responsibleId: '',
    deadline: '',
    priority: 'MEDIUM',
    status: 'PENDING',
  });

  const handleLogout = () => {
    localStorage.removeItem('agrotask_token');
    localStorage.removeItem('agrotask_user');
    localStorage.removeItem('agrotask_farm');
    localStorage.removeItem('agrotask_membership');
    navigate('/', { replace: true });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDateTimeLocal = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60000);

    return adjustedDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoadingPage(true);
        setErrorMessage('');
        setSuccessMessage('');

        const taskResponse = await api.get(`/tasks/${id}`);
        const task = taskResponse.data.task;

        setFormData({
          title: task.title || '',
          description: task.description || '',
          area: task.area === 'Sem área informada' ? '' : task.area || '',
          responsibleId: String(task.responsible?.id || ''),
          deadline: formatDateTimeLocal(task.deadlineRaw || task.deadlineIso || ''),
          priority: task.priorityValue || 'MEDIUM',
          status: task.statusValue || 'PENDING',
        });

        if (isAdmin) {
          const formOptionsResponse = await api.get('/tasks/form-options');
          setUsers(formOptionsResponse.data.users || []);
        } else {
          setUsers([]);
        }
      } catch (error) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message ||
          'Não foi possível carregar os dados da tarefa.';

        if (status === 401) {
          handleLogout();
          return;
        }

        setErrorMessage(message);
      } finally {
        setLoadingPage(false);
      }
    }

    loadPageData();
  }, [id, isAdmin]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingTask(true);
      setErrorMessage('');
      setSuccessMessage('');

      const payload = isAdmin
        ? {
            title: formData.title,
            description: formData.description,
            area: formData.area,
            responsibleId: Number(formData.responsibleId),
            deadline: formData.deadline,
            priority: formData.priority,
            status: formData.status,
          }
        : {
            status: formData.status,
          };

      const response = await api.put(`/tasks/${id}`, payload);

      setSuccessMessage(
        response.data.message || 'Tarefa atualizada com sucesso.'
      );

      setTimeout(() => {
        navigate(`/task-details/${id}`, { replace: true });
      }, 900);
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message || 'Não foi possível atualizar a tarefa.';

      if (status === 401) {
        handleLogout();
        return;
      }

      setErrorMessage(message);
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <AppShell title="Editar Tarefa" pageClassName="edit-task-page">
      <div className="edit-task-shell">
        <div className="edit-task-container">
          <Link to={`/task-details/${id}`} className="edit-task-back-link">
            <img src={backIcon} alt="" className="edit-task-back-icon" />
            <span>Voltar</span>
          </Link>

          <div className="edit-task-page-header">
            <h2>{isAdmin ? 'Editar tarefa' : 'Atualizar status da tarefa'}</h2>
            <p>
              {isAdmin
                ? 'Atualize as informações da tarefa abaixo'
                : 'Como funcionário, você pode alterar apenas o status da tarefa'}
            </p>
          </div>

          {errorMessage && (
            <div className="edit-task-feedback error">{errorMessage}</div>
          )}

          {successMessage && (
            <div className="edit-task-feedback success">{successMessage}</div>
          )}

          {loadingPage ? (
            <div className="edit-task-feedback info">
              Carregando dados da tarefa...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <section className="edit-task-card">
                <div className="edit-task-card-header">
                  <h3>IDENTIFICAÇÃO</h3>
                </div>

                <div className="edit-task-card-body">
                  <div className="edit-task-field">
                    <label htmlFor="titulo">
                      Título <span>*</span>
                    </label>
                    <input
                      id="titulo"
                      type="text"
                      value={formData.title}
                      onChange={(event) =>
                        handleChange('title', event.target.value)
                      }
                      placeholder="Ex: Aplicação de defensivo – Talhão 4"
                      required
                      disabled={!isAdmin}
                    />
                  </div>

                  <div className="edit-task-field">
                    <label htmlFor="descricao">
                      Descrição <span>*</span>
                    </label>
                    <textarea
                      id="descricao"
                      rows="5"
                      placeholder="Descreva detalhadamente o que deve ser feito, incluindo procedimentos e observações relevantes"
                      value={formData.description}
                      onChange={(event) =>
                        handleChange('description', event.target.value)
                      }
                      required
                      disabled={!isAdmin}
                    />
                  </div>

                  <div className="edit-task-field">
                    <label htmlFor="area">Área / Local</label>
                    <input
                      id="area"
                      type="text"
                      value={formData.area}
                      onChange={(event) =>
                        handleChange('area', event.target.value)
                      }
                      placeholder="Ex: Pastagem A, Talhão 4, Galpão 2"
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              </section>

              <section className="edit-task-card">
                <div className="edit-task-card-header">
                  <h3>RESPONSABILIDADE E PRAZO</h3>
                </div>

                <div className="edit-task-card-body edit-task-grid">
                  <div className="edit-task-field">
                    <label htmlFor="responsavel">
                      Responsável <span>*</span>
                    </label>
                    <select
                      id="responsavel"
                      value={formData.responsibleId}
                      onChange={(event) =>
                        handleChange('responsibleId', event.target.value)
                      }
                      required
                      disabled={!isAdmin}
                    >
                      <option value="">Selecione um responsável</option>

                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="edit-task-field">
                    <label htmlFor="prazo">
                      Prazo <span>*</span>
                    </label>
                    <input
                      id="prazo"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(event) =>
                        handleChange('deadline', event.target.value)
                      }
                      required
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              </section>

              <section className="edit-task-card">
                <div className="edit-task-card-header">
                  <h3>CLASSIFICAÇÃO</h3>
                </div>

                <div className="edit-task-card-body">
                  <div className="edit-task-classification-grid">
                    <div className="edit-task-priority-block">
                      <label className="edit-task-section-label">
                        Prioridade
                      </label>

                      <div className="edit-task-priority-options">
                        <button
                          type="button"
                          className={`priority-option ${
                            formData.priority === 'LOW' ? 'active low' : ''
                          }`}
                          onClick={() => handleChange('priority', 'LOW')}
                          disabled={!isAdmin}
                        >
                          Baixa
                        </button>

                        <button
                          type="button"
                          className={`priority-option ${
                            formData.priority === 'MEDIUM'
                              ? 'active medium'
                              : ''
                          }`}
                          onClick={() => handleChange('priority', 'MEDIUM')}
                          disabled={!isAdmin}
                        >
                          Média
                        </button>

                        <button
                          type="button"
                          className={`priority-option ${
                            formData.priority === 'HIGH' ? 'active high' : ''
                          }`}
                          onClick={() => handleChange('priority', 'HIGH')}
                          disabled={!isAdmin}
                        >
                          Alta
                        </button>
                      </div>
                    </div>

                    <div className="edit-task-status-block">
                      <label className="edit-task-section-label">Status</label>

                      <div className="edit-task-status-options">
                        <button
                          type="button"
                          className={`status-option pending ${
                            formData.status === 'PENDING' ? 'active' : ''
                          }`}
                          onClick={() => handleChange('status', 'PENDING')}
                        >
                          <span className="status-option-left">
                            <span className="status-dot" />
                            <span>Pendente</span>
                          </span>
                          {formData.status === 'PENDING' && (
                            <span className="status-check">✓</span>
                          )}
                        </button>

                        <button
                          type="button"
                          className={`status-option progress ${
                            formData.status === 'IN_PROGRESS'
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => handleChange('status', 'IN_PROGRESS')}
                        >
                          <span className="status-option-left">
                            <span className="status-dot" />
                            <span>Em andamento</span>
                          </span>
                          {formData.status === 'IN_PROGRESS' && (
                            <span className="status-check">✓</span>
                          )}
                        </button>

                        <button
                          type="button"
                          className={`status-option completed ${
                            formData.status === 'COMPLETED' ? 'active' : ''
                          }`}
                          onClick={() => handleChange('status', 'COMPLETED')}
                        >
                          <span className="status-option-left">
                            <span className="status-dot" />
                            <span>Concluída</span>
                          </span>
                          {formData.status === 'COMPLETED' && (
                            <span className="status-check">✓</span>
                          )}
                        </button>

                        <button
                          type="button"
                          className={`status-option late ${
                            formData.status === 'LATE' ? 'active' : ''
                          }`}
                          onClick={() => handleChange('status', 'LATE')}
                        >
                          <span className="status-option-left">
                            <span className="status-dot" />
                            <span>Atrasada</span>
                          </span>
                          {formData.status === 'LATE' && (
                            <span className="status-check">✓</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="edit-task-actions">
                <button
                  type="submit"
                  className="edit-task-save-button"
                  disabled={savingTask}
                >
                  <img
                    src={saveChangesIcon}
                    alt=""
                    className="edit-task-save-icon"
                  />
                  <span>
                    {savingTask
                      ? 'Salvando...'
                      : isAdmin
                      ? 'Salvar alterações'
                      : 'Salvar status'}
                  </span>
                </button>

                <Link
                  to={`/task-details/${id}`}
                  className="edit-task-cancel-button"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default EditTask;