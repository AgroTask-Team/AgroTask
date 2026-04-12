import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoAgroTask from '../../assets/icons/LogoAgroTask.svg';
import codeIcon from '../../assets/icons/Código.svg';
import api from '../../services/api';
import './RegisterEmployee.css';

function RegisterEmployee() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    inviteCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const saveAuthData = (data) => {
    const { token, user, farm, membership } = data;

    localStorage.setItem('agrotask_token', token);
    localStorage.setItem('agrotask_user', JSON.stringify(user));
    localStorage.setItem('agrotask_farm', JSON.stringify(farm));
    localStorage.setItem('agrotask_membership', JSON.stringify(membership));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const normalizedValue =
      name === 'inviteCode' ? value.toUpperCase().replace(/\s+/g, '') : value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: normalizedValue,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleGoogleRegister = async (response) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      if (!formData.inviteCode) {
        setErrorMessage(
          'Informe o código da fazenda antes de continuar com Google.'
        );
        return;
      }

      const apiResponse = await api.post('/auth/google/register/employee', {
        credential: response.credential,
        inviteCode: formData.inviteCode,
      });

      saveAuthData(apiResponse.data);
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Não foi possível entrar na fazenda com Google agora. Tente novamente.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!window.google || !googleButtonRef.current || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleRegister,
    });

    googleButtonRef.current.innerHTML = '';

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: '452',
      text: 'signup_with',
      shape: 'pill',
    });
  }, [formData.inviteCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.post('/auth/register/employee', {
        name: formData.name,
        email: formData.email,
        senha: formData.senha,
        confirmarSenha: formData.confirmarSenha,
        inviteCode: formData.inviteCode,
      });

      saveAuthData(response.data);
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Não foi possível entrar na fazenda agora. Tente novamente.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-employee-page">
      <div className="register-employee-left">
        <div className="register-employee-brand">
          <div className="register-employee-brand-icon">
            <img src={logoAgroTask} alt="Logo AgroTask" />
          </div>
          <span>AgroTask</span>
        </div>

        <div className="register-employee-left-content">
          <h1>Entre no ambiente certo da operação com o código da fazenda.</h1>

          <p>
            Use o código informado pelo administrador para se vincular à fazenda
            correta e acessar suas atividades dentro do ambiente da equipe.
          </p>

          <div className="register-employee-highlight-card">
            <span className="register-employee-highlight-label">
              Ao entrar na fazenda você passa a ter
            </span>

            <div className="register-employee-highlight-grid">
              <div className="register-employee-highlight-item">
                <strong>Tarefas da equipe</strong>
                <span>Visualização das atividades ligadas à operação em que você atua</span>
              </div>

              <div className="register-employee-highlight-item">
                <strong>Acompanhamento diário</strong>
                <span>Consulta rápida de status, prazos e prioridades da rotina</span>
              </div>

              <div className="register-employee-highlight-item">
                <strong>Registro de execução</strong>
                <span>Envio de evidências e atualização das tarefas quando necessário</span>
              </div>

              <div className="register-employee-highlight-item">
                <strong>Vínculo correto</strong>
                <span>Entrada no ambiente certo, separado da fazenda e da equipe adequadas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="register-employee-footer">
          © 2026 AgroTask. Todos os direitos reservados.
        </div>
      </div>

      <div className="register-employee-right">
        <div className="register-employee-card">
          <div className="register-employee-back">
            <Link to="/register">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Voltar
            </Link>
          </div>

          <div className="register-employee-header">
            <h2>Entrar em fazenda existente</h2>
            <p>
              Use o código informado pelo administrador para se vincular à
              fazenda correta
            </p>
          </div>

          <form className="register-employee-form" onSubmit={handleSubmit}>
            <div className="register-employee-section">
              <div className="register-employee-section-title">Seus dados</div>

              <div className="register-employee-field">
                <label htmlFor="name">Nome completo *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex: Carlos Mendes"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="register-employee-field">
                <label htmlFor="email">E-mail *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com.br"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="register-employee-field">
                <label htmlFor="senha">Senha *</label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="register-employee-field">
                <label htmlFor="confirmarSenha">Confirmar senha *</label>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="Repita a senha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="register-employee-code-box">
              <div className="register-employee-code-header">
                <div className="register-employee-code-icon">
                  <img
                    src={codeIcon}
                    alt=""
                    className="register-employee-code-icon-img"
                  />
                </div>

                <div>
                  <strong>Código da fazenda *</strong>
                  <span>Peça ao administrador se ainda não tiver</span>
                </div>
              </div>

              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                placeholder="AGR-XXXXXX"
                value={formData.inviteCode}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <small>Use exatamente o código informado pelo administrador.</small>
            </div>

            {errorMessage && (
              <div className="register-employee-error-message">{errorMessage}</div>
            )}

            <button
              type="submit"
              className="register-employee-submit-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar na fazenda'}
            </button>
          </form>

          <div className="register-employee-google-divider">
            <span>ou</span>
          </div>

          <div className="register-employee-google-wrapper">
            <div ref={googleButtonRef} />
          </div>

          <div className="register-employee-google-helper">
            Para usar Google, informe antes o código da fazenda.
          </div>

          <div className="register-employee-links">
            <p>
              Quer criar uma fazenda?{' '}
              <Link to="/register/admin">Criar minha fazenda</Link>
            </p>

            <p>
              Já tem uma conta? <Link to="/">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterEmployee;