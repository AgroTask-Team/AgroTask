import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import logoAgroTask from '../../assets/icons/LogoAgroTask.svg';
import backIcon from '../../assets/icons/Voltar.svg';
import '../ForgotPassword/ForgotPassword.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        senha,
        confirmarSenha,
      });

      setSuccessMessage(
        response.data?.message || 'Senha redefinida com sucesso.'
      );

      setTimeout(() => {
        navigate('/');
      }, 1800);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Não foi possível redefinir a senha agora.';

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-left">
        <div className="forgot-brand">
          <div className="forgot-brand-icon">
            <img src={logoAgroTask} alt="Logo AgroTask" />
          </div>
          <span>AgroTask</span>
        </div>

        <div className="forgot-left-content">
          <h1>Defina uma nova senha para voltar ao sistema.</h1>

          <p>
            Crie uma nova senha para continuar acessando o AgroTask com
            segurança e manter sua rotina operacional organizada.
          </p>

          <div className="forgot-highlight-card">
            <span className="forgot-highlight-label">Ao redefinir sua senha você pode</span>

            <div className="forgot-highlight-grid">
              <div className="forgot-highlight-item">
                <strong>Recuperar o acesso</strong>
                <span>Entrar novamente no sistema com uma nova senha segura</span>
              </div>

              <div className="forgot-highlight-item">
                <strong>Manter sua conta</strong>
                <span>Continuar utilizando o mesmo usuário já vinculado à fazenda</span>
              </div>

              <div className="forgot-highlight-item">
                <strong>Seguir a operação</strong>
                <span>Retomar tarefas, evidências e acompanhamentos normalmente</span>
              </div>

              <div className="forgot-highlight-item">
                <strong>Proteger seus dados</strong>
                <span>Renovar o acesso com um processo simples e controlado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="forgot-footer">
          © 2026 AgroTask. Todos os direitos reservados.
        </div>
      </div>

      <div className="forgot-right">
        <div className="forgot-form-wrapper">
          <Link to="/" className="forgot-back-link">
            <img src={backIcon} alt="" className="forgot-back-icon" />
            <span>Voltar ao login</span>
          </Link>

          <div className="forgot-form-header">
            <h2>Redefinir senha</h2>
            <p>Informe e confirme sua nova senha</p>
          </div>

          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="forgot-form-group">
              <label htmlFor="senha">Nova senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                placeholder="Digite sua nova senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="forgot-form-group">
              <label htmlFor="confirmarSenha">Confirmar nova senha</label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="forgot-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>

          {successMessage && (
            <div className="forgot-success-message">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;