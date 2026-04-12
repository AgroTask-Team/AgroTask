import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logoAgroTask from '../../assets/icons/LogoAgroTask.svg';
import backIcon from '../../assets/icons/Voltar.svg';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setEmailSent(false);
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });

      setMessage(
        response.data?.message ||
          'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.'
      );
      setEmailSent(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Não foi possível enviar as instruções agora. Tente novamente.';

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
          <h1>Recupere o acesso de forma simples e segura.</h1>

          <p>
            Informe o e-mail cadastrado para receber as instruções de
            recuperação e voltar a acessar a plataforma normalmente.
          </p>

          <div className="forgot-highlight-card">
            <span className="forgot-highlight-label">Neste processo você consegue</span>

            <div className="forgot-highlight-grid">
              <div className="forgot-highlight-item">
                <strong>Solicitar acesso</strong>
                <span>Enviar o pedido de recuperação usando seu e-mail cadastrado</span>
              </div>

              <div className="forgot-highlight-item">
                <strong>Receber instruções</strong>
                <span>Obter o passo a passo para redefinir sua senha com segurança</span>
              </div>

              <div className="forgot-highlight-item">
                <strong>Voltar rapidamente</strong>
                <span>Retomar o acesso ao sistema sem complicação no processo</span>
              </div>

              <div className="forgot-highlight-item">
                <strong>Manter a operação</strong>
                <span>Continuar acompanhando tarefas, equipes e evidências</span>
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
            <h2>Recuperar senha</h2>
            <p>Informe seu e-mail e enviaremos as instruções</p>
          </div>

          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="forgot-form-group">
              <label htmlFor="email">E-mail cadastrado</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="forgot-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </form>

          {emailSent && (
            <div className="forgot-success-message">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;