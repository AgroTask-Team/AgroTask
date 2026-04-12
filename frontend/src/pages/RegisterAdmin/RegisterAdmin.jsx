import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoAgroTask from '../../assets/icons/LogoAgroTask.svg';
import api from '../../services/api';
import './RegisterAdmin.css';

const SEGMENT_OPTIONS = [
  'Grãos',
  'Pecuária',
  'Hortifruti',
  'Café',
  'Cana-de-açúcar',
  'Agricultura Familiar',
  'Outro',
];

function RegisterAdmin() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    farmName: '',
    farmSegment: '',
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

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
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

      if (!formData.farmName || !formData.farmSegment) {
        setErrorMessage(
          'Informe o nome da fazenda e o segmento antes de continuar com Google.'
        );
        return;
      }

      const apiResponse = await api.post('/auth/google/register/admin', {
        credential: response.credential,
        farmName: formData.farmName,
        farmSegment: formData.farmSegment,
      });

      saveAuthData(apiResponse.data);
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Não foi possível criar sua conta com Google agora. Tente novamente.';

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
  }, [formData.farmName, formData.farmSegment]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.post('/auth/register/admin', {
        name: formData.name,
        email: formData.email,
        senha: formData.senha,
        confirmarSenha: formData.confirmarSenha,
        farmName: formData.farmName,
        farmSegment: formData.farmSegment,
      });

      saveAuthData(response.data);
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Não foi possível criar sua conta agora. Tente novamente.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-admin-page">
      <div className="register-admin-left">
        <div className="register-admin-brand">
          <div className="register-admin-brand-icon">
            <img src={logoAgroTask} alt="Logo AgroTask" />
          </div>
          <span>AgroTask</span>
        </div>

        <div className="register-admin-left-content">
          <h1>Estruture sua fazenda em um ambiente mais organizado e centralizado.</h1>

          <p>
            Cadastre sua operação, reúna sua equipe e comece a acompanhar tarefas,
            responsáveis, prazos e evidências em um só lugar.
          </p>

          <div className="register-admin-highlight-card">
            <span className="register-admin-highlight-label">
              Ao criar sua fazenda você passa a ter
            </span>

            <div className="register-admin-highlight-grid">
              <div className="register-admin-highlight-item">
                <strong>Equipe vinculada</strong>
                <span>Colaboradores conectados ao ambiente correto da operação</span>
              </div>

              <div className="register-admin-highlight-item">
                <strong>Gestão de tarefas</strong>
                <span>Criação e acompanhamento das atividades do dia a dia</span>
              </div>

              <div className="register-admin-highlight-item">
                <strong>Mais rastreabilidade</strong>
                <span>Evidências e histórico organizados dentro da fazenda</span>
              </div>

              <div className="register-admin-highlight-item">
                <strong>Visão gerencial</strong>
                <span>Indicadores para acompanhar andamento e produtividade</span>
              </div>
            </div>
          </div>
        </div>

        <div className="register-admin-footer">
          © 2026 AgroTask. Todos os direitos reservados.
        </div>
      </div>

      <div className="register-admin-right">
        <div className="register-admin-card">
          <div className="register-admin-back">
            <Link to="/register">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Voltar
            </Link>
          </div>

          <div className="register-admin-header">
            <h2>Criar minha fazenda</h2>
            <p>Cadastre seus dados e crie o ambiente da sua operação</p>
          </div>

          <form className="register-admin-form" onSubmit={handleSubmit}>
            <div className="register-admin-section">
              <div className="register-admin-section-title">Seus dados</div>

              <div className="register-admin-field">
                <label htmlFor="name">Nome completo *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex: João Oliveira"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="register-admin-field">
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

              <div className="register-admin-field">
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

              <div className="register-admin-field">
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

            <div className="register-admin-section">
              <div className="register-admin-section-title">
                Dados da fazenda
              </div>

              <div className="register-admin-field">
                <label htmlFor="farmName">Nome da fazenda *</label>
                <input
                  id="farmName"
                  name="farmName"
                  type="text"
                  placeholder="Ex: Fazenda Santa Clara"
                  value={formData.farmName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="register-admin-field">
                <label htmlFor="farmSegment">Segmento da fazenda *</label>
                <select
                  id="farmSegment"
                  name="farmSegment"
                  value={formData.farmSegment}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="">Selecione o segmento</option>
                  {SEGMENT_OPTIONS.map((segment) => (
                    <option key={segment} value={segment}>
                      {segment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="register-admin-error-message">{errorMessage}</div>
            )}

            <button
              type="submit"
              className="register-admin-submit-button"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta e fazenda'}
            </button>
          </form>

          <div className="register-admin-google-divider">
            <span>ou</span>
          </div>

          <div className="register-admin-google-wrapper">
            <div ref={googleButtonRef} />
          </div>

          <div className="register-admin-google-helper">
            Para usar Google, informe antes o nome e o segmento da fazenda.
          </div>

          <div className="register-admin-links">
            <p>
              Vai entrar em uma fazenda existente?{' '}
              <Link to="/register/employee">Usar código de convite</Link>
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

export default RegisterAdmin;