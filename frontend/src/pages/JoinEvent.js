import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoEnterOutline, IoArrowBack, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoLinkOutline, IoCalendarOutline, IoLocationOutline, IoTimeOutline } from 'react-icons/io5';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventService from '../services/EventService';
import ParticipantService from '../services/ParticipantService';
import AuthService from '../services/AuthService';
import './JoinEvent.css';

export default function JoinEvent() {
  const { token } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [showTokenForm, setShowTokenForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Se há token na URL, validar automaticamente
    if (token) {
      setValidating(true);
      validateInviteToken(token);
    } else {
      // Se não há token, mostrar formulário para inserir token
      setShowTokenForm(true);
    }
  }, [navigate, token]);
  const validateInviteToken = async (tokenToValidate = null) => {
    setValidating(true);
    setError('');
    
    const targetToken = tokenToValidate || token;
    if (!targetToken) {
      setError('Token de convite é obrigatório');
      setValidating(false);
      return;
    }
    
    try {
      const result = await EventService.validateInviteToken(targetToken);
      
      if (result.success) {
        setEvent(result.data);
        setValidating(false);
        setShowTokenForm(false);
      } else {
        setError(result.message || 'Token de convite inválido');
        setValidating(false);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Erro ao validar token de convite');
      setValidating(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para formatar hora
  const formatTime = (timeString) => {
    if (!timeString) return 'Horário não definido';
    
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    return timeString;
  };
  const handleJoinEvent = async () => {
    setJoining(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      // Se há token, usar o método de convite, senão usar o método público
      if (token) {
        result = await ParticipantService.joinEventWithInvite(event.id, token);
      } else {
        result = await ParticipantService.joinPublicEvent(event.id);
      }

      if (result.success) {
        setSuccess('Parabéns! Você agora é um participante deste evento.');
        setTimeout(() => {
          navigate(`/event/${event.id}`);
        }, 2000);
      } else {
        setError(result.message || 'Erro ao participar do evento');
      }
    } catch (err) {
      console.error('Join event error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setJoining(false);
    }
  };

  const handleManualTokenSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setError('Por favor, insira um token válido');
      return;
    }
    validateInviteToken(manualToken.trim());
  };

  if (validating) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div className="loading-message">
                <div className="loading-spinner" />
                Validando convite...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  if (error && !event && !showTokenForm) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div className="error-message">{error}</div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button className="modern-btn" onClick={() => {
                  setError('');
                  setShowTokenForm(true);
                }}>
                  Tentar novamente
                </button>
                <button className="modern-btn" onClick={() => navigate('/main')} style={{ marginLeft: '10px' }}>
                  Voltar para o início
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show token form when no token in URL
  if (showTokenForm && !event) {
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
                  <div className="subtitle">Insira o código de convite</div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="token-form-section">
                <div className="token-form-header">
                  <IoLinkOutline className="token-icon" />
                  <h3>Código de Convite</h3>
                  <p>Insira o código de convite que você recebeu para participar do evento.</p>
                </div>

                <form onSubmit={handleManualTokenSubmit} className="token-form">
                  <div className="form-group">
                    <label htmlFor="token">Código de Convite</label>
                    <input
                      type="text"
                      id="token"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Cole aqui o código de convite"
                      className="form-input"
                      disabled={validating}
                    />
                  </div>

                  {error && <div className="status-message status-error">{error}</div>}

                  <button 
                    type="submit" 
                    className="modern-btn modern-btn-primary"
                    disabled={validating || !manualToken.trim()}
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
                </form>

                <div className="token-help">
                  <h4>💡 Onde encontrar o código?</h4>
                  <ul>
                    <li>Em um link de convite recebido por mensagem</li>
                    <li>Em um QR code compartilhado pelo organizador</li>
                    <li>Diretamente do organizador do evento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
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
                <h1>Convite para Evento</h1>
                <div className="subtitle">Você foi convidado para participar</div>
              </div>
            </div>
          </div>

          {event && (
            <div className="glass-card-large">
              {/* Event Header with Background Image */}
              <div 
                className="event-header-join" 
                style={{
                  backgroundImage: event.photo ? `url(${event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`})` : 'none'
                }}
              >
                <div className="event-header-overlay-join"></div>
                <div className="event-info-join">
                  <h2 className="event-title-join">{event.name}</h2>
                  <div className="event-details-join">
                    <div className="event-detail-item">
                      <IoLocationOutline />
                      <span>{event.location || event.localization || 'Local não informado'}</span>
                    </div>
                    <div className="event-detail-item">
                      <IoCalendarOutline />
                      <span>{formatDate(event.dateFixedStart || event.dateStart)}</span>
                    </div>
                    <div className="event-detail-item">
                      <IoTimeOutline />
                      <span>{formatTime(event.timeFixedStart || event.timeStart)} - {formatTime(event.timeFixedEnd || event.timeEnd)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="join-content">
                {event.description && (
                  <div className="event-description-join">
                    <h3>Sobre o evento</h3>
                    <p>{event.description}</p>
                  </div>
                )}                <div className="join-section">
                  <h3>Participar do Evento</h3>
                  
                  {/* Verificar se o evento está ativo */}
                  {event.isActive ? (
                    <div className="event-active-warning">
                      <IoCloseCircleOutline className="warning-icon" />
                      <div>
                        <p><strong>Este evento já foi iniciado</strong></p>
                        <p>Não é mais possível participar deste evento pois ele já começou.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>Clique no botão abaixo para confirmar sua participação neste evento.</p>
                      
                      {error && <div className="status-message status-error">{error}</div>}
                      {success && <div className="status-message status-success">{success}</div>}

                      <button 
                        className="join-btn"
                        onClick={handleJoinEvent}
                        disabled={joining || success}
                      >
                        {joining ? (
                          <>
                            <div className="loading-spinner" />
                            Participando...
                          </>
                        ) : success ? (
                          <>
                        <IoCheckmarkCircleOutline />
                        Participação Confirmada!
                      </>
                    ) : (
                      <>
                        <IoEnterOutline />
                        Confirmar Participação
                      </>
                    )}
                  </button>                  <div className="join-info">
                    <p>
                      <strong>📋 O que acontece depois:</strong>
                    </p>
                    <ul>
                      <li>Você será adicionado à lista de participantes</li>
                      <li>Receberá notificações sobre atualizações do evento</li>
                      <li>Poderá visualizar detalhes completos do evento</li>
                    </ul>
                  </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

