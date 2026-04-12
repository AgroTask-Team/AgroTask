import { Link, useNavigate } from 'react-router-dom';
import logoAgroTask from '../../assets/icons/LogoAgroTask.svg';
import criarFazendaIcon from '../../assets/icons/CriarFazenda.svg';
import fazendaExistenteIcon from '../../assets/icons/FazendaExistente.svg';
import './RegisterChoice.css';

function RegisterChoice() {
  const navigate = useNavigate();

  return (
    <div className="register-choice-page">
      <div className="register-choice-left">
        <div className="register-choice-brand">
          <div className="register-choice-brand-icon">
            <img src={logoAgroTask} alt="Logo AgroTask" />
          </div>
          <span>AgroTask</span>
        </div>

        <div className="register-choice-left-content">
          <h1>Escolha a forma certa de entrar na operação.</h1>

          <p>
            Defina se você vai criar o ambiente da fazenda como responsável pela
            operação ou se vai entrar com um código de convite já recebido.
          </p>

          <div className="register-choice-highlight-card">
            <span className="register-choice-highlight-label">
              Nesta etapa você pode
            </span>

            <div className="register-choice-highlight-grid">
              <div className="register-choice-highlight-item">
                <strong>Criar sua fazenda</strong>
                <span>Iniciar um novo ambiente para organizar equipe, tarefas e acompanhamento</span>
              </div>

              <div className="register-choice-highlight-item">
                <strong>Entrar com código</strong>
                <span>Vincular-se a uma fazenda já existente de forma rápida e correta</span>
              </div>

              <div className="register-choice-highlight-item">
                <strong>Separar acessos</strong>
                <span>Cada usuário entra no fluxo adequado ao seu papel dentro da operação</span>
              </div>

              <div className="register-choice-highlight-item">
                <strong>Manter organização</strong>
                <span>Garantir que dados, tarefas e responsáveis fiquem no ambiente certo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="register-choice-footer">
          © 2026 AgroTask. Todos os direitos reservados.
        </div>
      </div>

      <div className="register-choice-right">
        <div className="register-choice-card">
          <div className="register-choice-header">
            <h2>Criar conta</h2>
            <p>Escolha como deseja entrar no AgroTask</p>
          </div>

          <div className="register-choice-options">
            <button
              type="button"
              className="register-choice-option"
              onClick={() => navigate('/register/admin')}
            >
              <div className="register-choice-option-icon register-choice-option-icon--green">
                <img
                  src={criarFazendaIcon}
                  alt=""
                  className="register-choice-option-icon-img"
                />
              </div>

              <div className="register-choice-option-content">
                <strong>Criar minha fazenda</strong>
                <span>
                  Para proprietários, gestores ou responsáveis pela operação
                  rural.
                </span>
              </div>

              <div className="register-choice-option-arrow">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </div>
            </button>

            <button
              type="button"
              className="register-choice-option"
              onClick={() => navigate('/register/employee')}
            >
              <div className="register-choice-option-icon">
                <img
                  src={fazendaExistenteIcon}
                  alt=""
                  className="register-choice-option-icon-img"
                />
              </div>

              <div className="register-choice-option-content">
                <strong>Entrar em fazenda existente</strong>
                <span>
                  Para funcionários ou colaboradores que receberam o código da
                  fazenda.
                </span>
              </div>

              <div className="register-choice-option-arrow">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </div>
            </button>
          </div>

          <div className="register-choice-divider" />

          <p className="register-choice-login-link">
            Já tem uma conta? <Link to="/">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterChoice;