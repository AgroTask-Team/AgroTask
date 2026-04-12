import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoAgroTask from '../../assets/icons/LogoAgroTask.svg';
import api from '../../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const saveAuthData = (data) => {
    const { token, user, farm, membership } = data;

    localStorage.setItem('agrotask_token', token);
    localStorage.setItem('agrotask_user', JSON.stringify(user));
    localStorage.setItem('agrotask_farm', JSON.stringify(farm));
    localStorage.setItem('agrotask_membership', JSON.stringify(membership));
  };

  const handleGoogleLogin = async (response) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const apiResponse = await api.post('/auth/google/login', {
        credential: response.credential,
      });

      saveAuthData(apiResponse.data);
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Não foi possível entrar com Google. Tente novamente.';

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
      callback: handleGoogleLogin,
    });

    googleButtonRef.current.innerHTML = '';

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: '452',
      text: 'signin_with',
      shape: 'pill',
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.post('/auth/login', {
        email: formData.email,
        senha: formData.senha,
      });

      saveAuthData(response.data);

      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Não foi possível entrar. Verifique suas credenciais e tente novamente.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <img src={logoAgroTask} alt="Logo AgroTask" />
          </div>
          <span>AgroTask</span>
        </div>

        <div className="login-left-content">
          <h1>Organize melhor a rotina da sua fazenda.</h1>

          <p>
            Centralize tarefas, responsáveis, prazos, evidências e histórico em
            um único ambiente, mantendo a operação mais organizada no dia a dia.
          </p>

          <div className="login-highlight-card">
            <span className="login-highlight-label">No AgroTask você acompanha</span>

            <div className="login-highlight-grid">
              <div className="login-highlight-item">
                <strong>Tarefas</strong>
                <span>Criação, andamento e conclusão das atividades</span>
              </div>

              <div className="login-highlight-item">
                <strong>Responsáveis</strong>
                <span>Distribuição clara do que cada pessoa deve executar</span>
              </div>

              <div className="login-highlight-item">
                <strong>Evidências</strong>
                <span>Registro da execução com mais rastreabilidade</span>
              </div>

              <div className="login-highlight-item">
                <strong>Dashboard</strong>
                <span>Visão rápida da operação e do progresso da equipe</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer">
          © 2026 AgroTask. Todos os direitos reservados.
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Bem-vindo de volta</h2>
            <p>Entre com suas credenciais para continuar</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com.br"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            {errorMessage && (
              <div className="login-error-message">{errorMessage}</div>
            )}

            <div className="login-forgot-password">
              <Link to="/forgot-password">Esqueceu a senha?</Link>
            </div>

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-google-divider">
            <span>ou</span>
          </div>

          <div className="login-google-wrapper">
            <div ref={googleButtonRef} />
          </div>

          <div className="login-divider" />

          <p className="login-register-link">
            Não tem uma conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;