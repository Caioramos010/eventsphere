import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEnterOutline, IoArrowBack, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoLinkOutline } from 'react-icons/io5';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import './JoinEvent.css';

export default function JoinEvent() {
  const [form, setForm] = useState({
    inviteToken: '',
    inviteCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
    }

    // Verificar se há parâmetros na URL (para links de convite)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const code = urlParams.get('code');
    
    if (token && code) {
      setForm({ inviteToken: token, inviteCode: code });
      // Auto-validar se ambos estão presentes
      validateInvite(token, code);
    }
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setSuccess('');
  }

  async function validateInvite(token = form.inviteToken, code = form.inviteCode) {
    if (!token || !code) {
      setError('Preencha o token e código do convite');
      return false;
    }

    setValidating(true);
    try {
      const result = await EventService.validateInvite(token, code);
      
      if (result.success) {
        setSuccess('Convite válido! Você pode participar do evento.');
        return true;
      } else {
        setError(result.message || 'Convite inválido');
        return false;
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Erro ao validar convite');
      return false;
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Primeiro validar o convite
      const isValid = await validateInvite();
      
      if (!isValid) {
        return;
      }

      // Se válido, participar do evento
      const result = await EventService.joinEventByInvite(form.inviteToken, form.inviteCode);

      if (result.success) {
        setSuccess(result.message || 'Participação confirmada com sucesso!');
        setTimeout(() => {
          navigate('/main');
        }, 2000);
      } else {
        setError(result.message || 'Erro ao participar do evento');
      }
    } catch (err) {
      console.error('Join event error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateOnly() {
    await validateInvite();
  }
  
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('/main')}>
              <IoArrowBack />
            </button>
            <div className="page-title">
              <IoEnterOutline className="page-icon" />
              <div>
                <h1>Participar de Evento</h1>
                <div className="subtitle">Use seu convite para entrar</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <form onSubmit={handleSubmit}>
              <div style={{
                color: 'var(--color-text-white)',
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '24px',
                lineHeight: '1.5'
              }}>
                Para participar de um evento, você precisa do token e código de convite fornecidos pelo organizador.
              </div>

              <div className="form-group">
                <label className="modern-label">Token do Convite *</label>
                <input
                  type="text"
                  name="inviteToken"
                  value={form.inviteToken}
                  onChange={handleChange}
                  className="modern-input"
                  placeholder="Ex: AbCdEf123456..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="modern-label">Código do Convite *</label>
                <input
                  type="text"
                  name="inviteCode"
                  value={form.inviteCode}
                  onChange={handleChange}
                  className="modern-input"
                  placeholder="Ex: 123456"
                  maxLength="6"
                  required
                />
              </div>

              <button 
                type="button"
                className="modern-btn-secondary" 
                onClick={handleValidateOnly}
                disabled={validating || !form.inviteToken || !form.inviteCode}
                style={{marginBottom: '16px', width: '100%'}}
              >
                {validating ? (
                  <>
                    <div className="loading-spinner" />
                    Validando...
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline />
                    Validar Convite
                  </>
                )}
              </button>

              {error && <div className="status-message status-error">{error}</div>}
              {success && <div className="status-message status-success">{success}</div>}

              <button 
                className="modern-btn" 
                type="submit" 
                disabled={loading || !success}
                style={{width: '100%'}}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" />
                    Participando...
                  </>
                ) : (
                  <>
                    <IoEnterOutline />
                    Participar do Evento
                  </>
                )}
              </button>

              <div className="tip-container">
                <p>
                  <span className="tip-highlight">💡 Dica:</span> O organizador pode enviar um link direto que preencherá automaticamente os campos.
                </p>
                <p>
                  <span className="tip-highlight">🔗 Link de convite:</span> Se você recebeu um link, basta clicar nele para preencher os dados automaticamente.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
