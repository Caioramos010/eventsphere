import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  IoPeopleOutline, 
  IoPlayOutline, 
  IoCreateOutline, 
  IoCloseOutline, 
  IoRemoveCircleOutline, 
  IoPrintOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline, 
  IoQrCodeOutline, 
  IoStopOutline,
  IoCalendarOutline,
  IoArrowBack,
  IoLocationOutline,
  IoTimeOutline,
  IoInformationCircleOutline,
  IoCheckmarkOutline
} from 'react-icons/io5';
import './EventDetails.css';
import userIcon from '../images/user.png';
import eventImg from '../images/event.png';
import getUserStatusIcon from '../utils/getUserStatusIcon';
import EventService from '../services/EventService';
import ParticipantService from '../services/ParticipantService';

// Função para formatar data
const formatDate = (dateString) => {
  if (!dateString) return 'Data não definida';
  
  // Se for uma string ISO ou objeto Date
  let date;
  if (typeof dateString === 'string') {
    // Verificar se é no formato ISO (2023-04-15) ou um timestamp
    if (dateString.includes('T') || !isNaN(Date.parse(dateString))) {
      date = new Date(dateString);
    } else {
      // Para datas no formato dd/mm/yyyy
      const parts = dateString.split('/');
      if (parts.length === 3) {
        date = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        return dateString; // Retorna a string original se não conseguir parsear
      }
    }
  } else if (dateString instanceof Date) {
    date = dateString;
  } else {
    return 'Data inválida';
  }
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para formatar hora
const formatTime = (timeString) => {
  if (!timeString) return 'Horário não definido';
  
  // Se for um objeto de hora Java (LocalTime)
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  
  // Se for um Date
  if (timeString instanceof Date) {
    return timeString.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return timeString; // Retorna a string original se não conseguir parsear
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [confirmationList, setConfirmationList] = useState([]);
  const [isEventActive, setIsEventActive] = useState(false);  const [userConfirmed, setUserConfirmed] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [showAttendanceReport, setShowAttendanceReport] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        console.log('EventDetails - ID do evento:', id);
        
        if (!id) {
          setError('ID do evento não especificado');
          setLoading(false);
          return;
        }
        
        // Tentativa com ID numérico
        let result = await EventService.getEventDetails(id);
        
        // Se falhar e o ID parecer ser uma string, tente removendo possíveis aspas
        if (!result.success && typeof id === 'string' && (id.startsWith('"') || id.startsWith("'"))) {
          const cleanId = id.replace(/['"]/g, '');
          console.log('Tentando novamente com ID limpo:', cleanId);
          result = await EventService.getEventDetails(cleanId);
        }
        
        if (result.success) {
          console.log('Evento carregado com sucesso:', result.event);
          
          // Garantir que o evento tenha o ID da URL se não tiver ID próprio
          if (!result.event.id) {
            result.event.id = id;
          }
          
          const eventData = result.event;
          
          // O backend já fornece userStatus e userConfirmed
          setUserConfirmed(eventData.userConfirmed);          // Verificar se o evento está ativo
          setIsEventActive(eventData.state === 'ACTIVE');
          
          // Extrair colaboradores dos participantes
          const collaboratorsList = eventData.participants ? 
            eventData.participants
              .filter(participant => participant.isCollaborator)
              .map(collaborator => ({
                id: collaborator.userId,
                name: collaborator.userName || collaborator.userUsername,
                email: collaborator.userEmail,
                imageUrl: collaborator.userPhoto
              }))
            : [];
          
          // Definir o evento e as listas de participantes no estado
          setEvent(eventData);
          setCollaborators(collaboratorsList);
          setConfirmationList(eventData.participants || []);
          
        } else {
          setError(result.message || 'Não foi possível carregar os detalhes do evento');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Erro ao carregar os detalhes do evento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const handleInviteClick = () => {
    navigate(`/event/${id}/invite`);
  };

  const handleStartEvent = async () => {
    try {
      const result = await EventService.startEvent(id);
      if (result.success) {
        setIsEventActive(true);
        setEvent(prev => ({...prev, status: 'active', state: 'ACTIVE'}));
        alert('Evento iniciado com sucesso!');
      } else {
        alert(result.message || 'Erro ao iniciar o evento');
      }
    } catch (error) {
      console.error('Error starting event:', error);
      alert('Erro ao iniciar o evento');
    }
  };

  const handleEndEvent = async () => {
    try {
      const result = await EventService.finishEvent(id);
      if (result.success) {
        setIsEventActive(false);
        setEvent(prev => ({...prev, status: 'finished', state: 'FINISHED'}));
        alert('Evento encerrado com sucesso!');
      } else {
        alert(result.message || 'Erro ao encerrar o evento');
      }
    } catch (error) {
      console.error('Error ending event:', error);
      alert('Erro ao encerrar o evento');
    }
  };

  const handleScanQRCode = () => {
    navigate(`/event/${id}/qr-scanner`);
  };
  const handleEditEvent = () => {
    navigate(`/edit-event/${id}`);
  };

  const handleCancelEvent = async () => {
    if (window.confirm('Tem certeza que deseja cancelar este evento?')) {
      try {
        const result = await EventService.cancelEvent(id);
        if (result.success) {
          alert('Evento cancelado com sucesso');
          navigate('/main');
        } else {
          alert(result.message || 'Erro ao cancelar o evento');
        }
      } catch (error) {
        console.error('Error cancelling event:', error);
        alert('Erro ao cancelar o evento');
      }
    }
  };
  const handleConfirmAttendance = async () => {
    try {
      const result = await ParticipantService.confirmAttendance(id);
      if (result.success) {
        alert('Confirmação de presença enviada!');
        setUserConfirmed(true);
        // Atualizar a lista de participantes
        const updatedEvent = await EventService.getEventDetails(id);
        if (updatedEvent.success) {
          setEvent(updatedEvent.event);
        }
      } else {
        alert(result.message || 'Erro ao confirmar presença');
      }
    } catch (error) {
      console.error('Error confirming attendance:', error);
      alert('Erro ao confirmar presença');
    }
  };
  const handleGenerateQRCode = () => {
    // Navegar para a página de QR Code do participante
    navigate(`/event/${id}/my-qrcode`);
  };

  const handleJoinEvent = async () => {
    try {
      // Supondo que temos um endpoint para participar diretamente de um evento público
      const result = await ParticipantService.joinPublicEvent(id);
      if (result.success) {
        alert('Você agora é um participante deste evento!');
        // Recarregar os dados do evento para atualizar o status do usuário
        const updatedEvent = await EventService.getEventDetails(id);
        if (updatedEvent.success) {
          setEvent(updatedEvent.event);
        }
      } else {
        alert(result.message || 'Erro ao participar do evento');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Erro ao participar do evento');
    }
  };

  const handlePrintList = () => {
    window.print();
  };

  const handleRemoveCollaborator = async (userId) => {
    if (window.confirm('Tem certeza que deseja remover este colaborador?')) {
      try {
        const result = await EventService.removeCollaborator(id, userId);
        if (result.success) {
          // Update collaborators list
          setCollaborators(prevCollaborators => 
            prevCollaborators.filter(c => c.id !== userId)
          );
          alert('Colaborador removido com sucesso!');
        } else {
          alert(result.message || 'Erro ao remover colaborador');
        }
      } catch (error) {
        console.error('Error removing collaborator:', error);
        alert('Erro ao remover colaborador');
      }
    }
  };

  // Funções para gerenciar participantes
  const openParticipantModal = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantModal(true);
  };

  const closeParticipantModal = () => {
    setSelectedParticipant(null);
    setShowParticipantModal(false);
  };
  const handleRemoveParticipant = async (participantId) => {
    try {
      const result = await ParticipantService.removeParticipant(id, participantId);
      if (result.success) {
        // Atualizar a lista de participantes
        setConfirmationList(prev => prev.filter(p => p.userId !== participantId));
        closeParticipantModal();
        alert('Participante removido com sucesso!');
      } else {
        alert(result.message || 'Erro ao remover participante');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Erro ao remover participante');
    }
  };

  const handleConfirmParticipant = async (participantId) => {
    try {
      const result = await ParticipantService.confirmParticipant(id, participantId);
      if (result.success) {
        // Atualizar a lista de participantes
        setConfirmationList(prev => 
          prev.map(p => p.userId === participantId ? { ...p, confirmed: true } : p)
        );
        closeParticipantModal();
        alert('Participação confirmada com sucesso!');
      } else {
        alert(result.message || 'Erro ao confirmar participante');
      }
    } catch (error) {
      console.error('Error confirming participant:', error);
      alert('Erro ao confirmar participante');
    }
  };

  const handlePromoteToCollaborator = async (participantId) => {
    try {
      const result = await ParticipantService.promoteToCollaborator(id, participantId);
      if (result.success) {
        // Atualizar a lista de participantes
        setConfirmationList(prev => 
          prev.map(p => p.userId === participantId ? { ...p, isCollaborator: true } : p)
        );
        closeParticipantModal();
        alert('Participante promovido a colaborador com sucesso!');
      } else {
        alert(result.message || 'Erro ao promover participante');
      }
    } catch (error) {
      console.error('Error promoting participant:', error);
      alert('Erro ao promover participante');
    }
  };

  const handleDemoteCollaborator = async (participantId) => {
    try {
      const result = await ParticipantService.demoteCollaborator(id, participantId);
      if (result.success) {
        // Atualizar a lista de participantes
        setConfirmationList(prev => 
          prev.map(p => p.userId === participantId ? { ...p, isCollaborator: false } : p)
        );
        closeParticipantModal();
        alert('Colaborador removido com sucesso!');
      } else {
        alert(result.message || 'Erro ao remover colaborador');
      }
    } catch (error) {
      console.error('Error demoting collaborator:', error);
      alert('Erro ao remover colaborador');
    }
  };

  // Funções para QR Code e presença
  const generateQrCode = async () => {
    try {
      const result = await ParticipantService.generateQrCode(id);
      if (result.success) {
        setQrCode(result.data);
        setShowQrModal(true);
      } else {
        alert(result.message || 'Erro ao gerar QR Code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Erro ao gerar QR Code');
    }
  };

  const loadAttendanceReport = async () => {
    try {
      const result = await ParticipantService.getAttendanceReport(id);
      if (result.success) {
        setAttendanceReport(result.data);
        setShowAttendanceReport(true);
      } else {
        alert(result.message || 'Erro ao carregar relatório');
      }
    } catch (error) {
      console.error('Error loading attendance report:', error);
      alert('Erro ao carregar relatório');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                Carregando...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                {error}
              </div>
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <button className="modern-btn" onClick={() => navigate('/main')}>
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

  if (!event) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                Evento não encontrado
              </div>
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <button className="modern-btn" onClick={() => navigate('/main')}>
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

  const canEdit = event.userStatus === 'owner' || event.userStatus === 'collaborator';

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
              <IoCalendarOutline className="page-icon" />
              <div>
                <h1>Detalhes do Evento</h1>
                <div className="subtitle">Gerencie seu evento</div>
              </div>
            </div>
          </div>          {/* Event Info Card */}          
          <div className={`glass-card-large ${isEventActive ? 'event-active' : ''}`}>            {/* Status Badge no topo direito */}
            <div className="event-status-container">
              {isEventActive ? (
                <div className="event-active-badge">
                  <div className="event-active-pulse"></div>
                  <span>EVENTO ATIVO</span>
                </div>
              ) : event.state === 'CANCELED' ? (
                <div className="event-cancelled-badge">
                  <span>EVENTO CANCELADO</span>
                </div>
              ) : event.state === 'FINISHED' ? (
                <div className="event-finished-badge">
                  <span>EVENTO ENCERRADO</span>
                </div>
              ) : null}
            </div>
            
            {/* Event Header with Background Image */}
            <div 
              className="event-header-with-image" 
              style={{
                backgroundImage: event.photo ? `url(${event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`})` : 'none'
              }}
              onClick={() => event.photo && setShowImageModal(true)}
            >
              <div className="event-header-overlay"></div>              <div className="event-header">
                <div className="event-header-left">
                  <h2 className="event-title">{event.name}</h2>
                </div>
                <div className="event-access-badge">{event.access || event.acess || event.type || 'PÚBLICO'}</div>
              </div>
            </div>
            
            <div className="event-content">
              <div className="event-info">
                <div className="event-info-item">
                  <IoLocationOutline />
                  <span>{event.location || event.localization || 'Local não informado'}</span>
                </div>
                <div className="event-info-item">
                  <IoCalendarOutline />
                  <span>{formatDate(event.dateFixedStart || event.dateStart)}</span>
                </div>
                <div className="event-info-item">
                  <IoTimeOutline />
                  <span>{formatTime(event.timeFixedStart || event.timeStart)} - {formatTime(event.timeFixedEnd || event.timeEnd)}</span>
                </div>
                <div className="event-info-item">
                  <IoInformationCircleOutline />
                  <span>{event.classification || event.ageRestriction || 'Livre'}</span>
                </div>
                
                <div className="event-description">
                  <h3>Descrição</h3>
                  <p>{event.description || 'Sem descrição'}</p>
                </div>
                
                {(event.maxParticipants || event.confirmedParticipants || event.participants) && (
                  <div className="event-capacity">
                    <div className="capacity-text">
                      <span className="capacity-confirmed">{event.confirmedParticipants || (event.participants ? event.participants.length : 0)}</span>
                      <span className="capacity-separator">/</span>
                      <span className="capacity-total">{event.maxParticipants || 'Ilimitado'}</span>
                    </div>
                    {event.maxParticipants > 0 && (
                      <div className="capacity-bar">
                        <div 
                          className="capacity-progress" 
                          style={{width: `${(event.confirmedParticipants || (event.participants ? event.participants.length : 0)) / event.maxParticipants * 100}%`}}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="event-actions">
                {/* Botão para convidar pessoas (visível para todos) */}
                <button className="modern-btn event-action-btn" onClick={handleInviteClick}>
                  <IoPeopleOutline />
                  <span>Convidar Pessoas</span>
                </button>
                  {/* Botões para donos e colaboradores */}
                {canEdit && (
                  <>
                    {event.state === 'CREATED' ? (
                      <>                        
                        <button className="modern-btn event-action-btn start-btn" onClick={handleStartEvent}>
                          <IoPlayOutline />
                          <span>Iniciar Evento</span>
                        </button>
                        <button className="modern-btn event-action-btn edit-btn" onClick={handleEditEvent}>
                          <IoCreateOutline />
                          <span>Editar Evento</span>
                        </button>
                        <button className="modern-btn event-action-btn cancel-btn" onClick={handleCancelEvent}>
                          <IoCloseOutline />
                          <span>Cancelar Evento</span>
                        </button>
                      </>
                    ) : event.state === 'ACTIVE' ? (
                      <>
                        <button className="modern-btn event-action-btn qrcode-btn" onClick={handleScanQRCode}>
                          <IoQrCodeOutline />
                          <span>Escanear QR-Code</span>
                        </button>
                        <button className="modern-btn event-action-btn end-btn" onClick={handleEndEvent}>
                          <IoStopOutline />
                          <span>Encerrar Evento</span>
                        </button>
                      </>
                    ) : (
                      /* Para eventos FINISHED ou CANCELED, não mostrar botões de ação */
                      <div className="event-completed-message">
                        {event.state === 'FINISHED' ? 'Evento encerrado' : 'Evento cancelado'}
                      </div>
                    )}
                  </>                )}
                  {/* Botão de QR Code para participantes durante evento ativo */}
                {!canEdit && event.userStatus === 'participant' && event.state === 'ACTIVE' && (
                  <button className="modern-btn event-action-btn qr-btn" onClick={generateQrCode}>
                    <IoQrCodeOutline />
                    <span>Meu QR Code</span>
                  </button>
                )}
                
                {/* Botão para ver relatório de presença (organizadores, eventos finalizados) */}
                {canEdit && event.state === 'FINISHED' && (
                  <button className="modern-btn event-action-btn report-btn" onClick={loadAttendanceReport}>
                    <IoCheckmarkCircleOutline />
                    <span>Relatório de Presença</span>
                  </button>
                )}
                
                  {/* Botão para participantes confirmarem presença */}
                {!canEdit && event.userStatus === 'participant' && !userConfirmed && event.state !== 'FINISHED' && event.state !== 'CANCELED' && (
                  <button className="modern-btn event-action-btn confirm-btn" onClick={handleConfirmAttendance}>
                    <IoCheckmarkOutline />
                    <span>Confirmar Presença</span>
                  </button>
                )}
                
                {/* Botão para visitantes participarem do evento */}
                {event.userStatus === 'visitor' && event.state !== 'FINISHED' && event.state !== 'CANCELED' && (
                  <button className="modern-btn event-action-btn join-btn" onClick={handleJoinEvent}>
                    <IoPeopleOutline />
                    <span>Participar do Evento</span>
                  </button>
                )}
                
                {/* Botão para gerar QR Code para participantes confirmados */}
                {!canEdit && userConfirmed && isEventActive && (
                  <button className="modern-btn event-action-btn qrcode-btn" onClick={handleGenerateQRCode}>
                    <IoQrCodeOutline />
                    <span>Meu QR Code</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Collaborators Section - Visível apenas para donos */}
          {event.userStatus === 'owner' && collaborators && collaborators.length > 0 && (
            <div className="glass-card">
              <div className="section-header">
                <h3>Colaboradores ({collaborators.length})</h3>
                <button className="modern-btn-secondary small-btn" onClick={handlePrintList}>
                  <IoPrintOutline />
                  <span>Imprimir</span>
                </button>
              </div>
              
              <div className="participant-list">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id || `collab-${Math.random()}`} className="participant-item">                    <div className="participant-avatar">
                      <img src={
                        collaborator.imageUrl 
                          ? (collaborator.imageUrl.startsWith('data:') ? collaborator.imageUrl : `data:image/jpeg;base64,${collaborator.imageUrl}`)
                          : userIcon
                      } alt="User" />
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{collaborator.name || collaborator.username || 'Colaborador'}</div>
                      <div className="participant-details">
                        {collaborator.email && <span>{collaborator.email}</span>}
                      </div>
                    </div>
                    <button className="participant-action remove-btn" onClick={() => handleRemoveCollaborator(collaborator.id)}>
                      <IoRemoveCircleOutline />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants List Section - Visible only to owners and collaborators */}
          {canEdit && confirmationList && confirmationList.length > 0 && (
            <div className="glass-card">
              <div className="section-header">
                <h3>Lista de Participantes ({confirmationList.length})</h3>
                <button className="modern-btn-secondary small-btn" onClick={handlePrintList}>
                  <IoPrintOutline />
                  <span>Imprimir</span>
                </button>
              </div>
                <div className="participant-list">
                {confirmationList.map(participant => (
                  <div 
                    key={participant.id || `part-${Math.random()}`} 
                    className="participant-item clickable"
                    onClick={() => openParticipantModal(participant)}
                  ><div className="participant-avatar">
                      <img src={
                        participant.userPhoto 
                          ? (participant.userPhoto.startsWith('data:') ? participant.userPhoto : `data:image/jpeg;base64,${participant.userPhoto}`)
                          : userIcon
                      } alt="User" />
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">
                        {participant.userName || participant.userUsername || 'Participante'}
                        {participant.isCollaborator && (
                          <span className="collaborator-badge">Colaborador</span>
                        )}
                      </div>
                      <div className="participant-details">
                        {participant.userEmail && <span>{participant.userEmail}</span>}
                      </div>
                    </div>
                    <div className={`participant-status ${participant.confirmed ? 'confirmed' : 'not-confirmed'}`}>
                      {participant.confirmed ? 
                        <IoCheckmarkCircleOutline /> : 
                        <IoCloseCircleOutline />
                      }
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="list-footer">
                <span>Confirmados: {confirmationList.filter(p => p.confirmed).length}</span>
                <span>Pendentes: {confirmationList.filter(p => !p.confirmed).length}</span>
              </div>
            </div>
          )}        </div>
      </div>
      
      {/* Image Modal */}
      {showImageModal && event.photo && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setShowImageModal(false)}>
              <IoCloseOutline />
            </button>
            <img 
              src={event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`}
              alt={event.name}
              className="image-modal-img"
            />
            <div className="image-modal-caption">
              <h3>{event.name}</h3>
              <p>Imagem do evento</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Participant Modal - Para gerenciar participantes individualmente */}
      {showParticipantModal && selectedParticipant && (
        <div className="participant-modal-overlay" onClick={closeParticipantModal}>
          <div className="participant-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="participant-modal-header">
              <h3>Participante: {selectedParticipant.userName || selectedParticipant.userEmail}</h3>
              <button className="participant-modal-close" onClick={closeParticipantModal}>
                <IoCloseOutline />
              </button>
            </div>
            
            <div className="participant-modal-content">
              <div className="participant-modal-avatar">
                <img src={
                  selectedParticipant.userPhoto 
                    ? (selectedParticipant.userPhoto.startsWith('data:') ? selectedParticipant.userPhoto : `data:image/jpeg;base64,${selectedParticipant.userPhoto}`)
                    : userIcon
                } alt="User" />
              </div>
              
              <div className="participant-modal-info">
                <div className="participant-modal-item">
                  <strong>Email:</strong> {selectedParticipant.userEmail}
                </div>
                <div className="participant-modal-item">
                  <strong>Status:</strong> {selectedParticipant.confirmed ? 'Confirmado' : 'Pendente'}
                </div>
                <div className="participant-modal-item">
                  <strong>Colaborador:</strong> {selectedParticipant.isCollaborator ? 'Sim' : 'Não'}
                </div>
              </div>
            </div>              <div className="participant-modal-actions">
              {/* Mostrar aviso se evento não permite modificações */}
              {(event.state === 'CANCELED' || event.state === 'ACTIVE' || event.state === 'FINISHED') && (
                <div className="modification-warning">
                  <IoInformationCircleOutline className="warning-icon" />
                  <span>
                    {event.state === 'CANCELED' ? 'Evento cancelado - nenhuma ação disponível' :
                     event.state === 'ACTIVE' ? 'Evento ativo - modificações não permitidas' :
                     'Evento encerrado - modificações não permitidas'}
                  </span>
                </div>
              )}
              
              {/* Botões disponíveis apenas para eventos CREATED */}
              {event.state === 'CREATED' && (
                <>
                  {!selectedParticipant.confirmed && (
                    <button className="modern-btn" onClick={() => handleConfirmParticipant(selectedParticipant.userId)}>
                      <IoCheckmarkOutline />
                      <span>Confirmar Participação</span>
                    </button>
                  )}
                  
                  {!selectedParticipant.isCollaborator && (
                    <button className="modern-btn" onClick={() => handlePromoteToCollaborator(selectedParticipant.userId)}>
                      <IoPeopleOutline />
                      <span>Promover a Colaborador</span>
                    </button>
                  )}
                  
                  {selectedParticipant.isCollaborator && (
                    <button className="modern-btn" onClick={() => handleDemoteCollaborator(selectedParticipant.userId)}>
                      <IoRemoveCircleOutline />
                      <span>Remover como Colaborador</span>
                    </button>
                  )}
                  
                  <button className="modern-btn remove-btn" onClick={() => handleRemoveParticipant(selectedParticipant.userId)}>
                    <IoRemoveCircleOutline />
                    <span>Remover Participante</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>      )}
      
      {/* QR Code Modal */}
      {showQrModal && qrCode && (
        <div className="qr-modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <h3>Seu QR Code de Presença</h3>
              <button className="qr-modal-close" onClick={() => setShowQrModal(false)}>
                <IoCloseOutline />
              </button>
            </div>
            
            <div className="qr-modal-content">
              <div className="qr-code-display">
                <div className="qr-code-text">{qrCode.qrCode}</div>
                <p>Mostre este código para o organizador marcar sua presença</p>
                <div className="qr-event-info">
                  <strong>Evento:</strong> {qrCode.eventName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Attendance Report Modal */}
      {showAttendanceReport && attendanceReport && (
        <div className="attendance-modal-overlay" onClick={() => setShowAttendanceReport(false)}>
          <div className="attendance-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h3>Relatório de Presença</h3>
              <button className="attendance-modal-close" onClick={() => setShowAttendanceReport(false)}>
                <IoCloseOutline />
              </button>
            </div>
            
            <div className="attendance-modal-content">
              <div className="attendance-summary">
                <h4>{attendanceReport.eventName}</h4>
                <div className="attendance-stats">
                  <div className="stat-item">
                    <span className="stat-number">{attendanceReport.totalParticipants}</span>
                    <span className="stat-label">Total de Participantes</span>
                  </div>
                  <div className="stat-item present">
                    <span className="stat-number">{attendanceReport.presentCount}</span>
                    <span className="stat-label">Presentes</span>
                  </div>
                  <div className="stat-item absent">
                    <span className="stat-number">{attendanceReport.absentCount}</span>
                    <span className="stat-label">Ausentes</span>
                  </div>
                </div>
              </div>
              
              <div className="attendance-lists">
                <div className="attendance-list present-list">
                  <h5>Participantes Presentes ({attendanceReport.presentCount})</h5>
                  {attendanceReport.presentParticipants.map(participant => (
                    <div key={participant.id} className="attendance-participant present">
                      <div className="participant-avatar">
                        <img src={
                          participant.userPhoto 
                            ? (participant.userPhoto.startsWith('data:') ? participant.userPhoto : `data:image/jpeg;base64,${participant.userPhoto}`)
                            : userIcon
                        } alt="User" />
                      </div>
                      <div className="participant-info">
                        <div className="participant-name">
                          {participant.userName}
                          {participant.isCollaborator && (
                            <span className="collaborator-badge">Colaborador</span>
                          )}
                        </div>
                        <div className="participant-email">{participant.userEmail}</div>
                      </div>
                      <div className="presence-status present">
                        <IoCheckmarkCircleOutline />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="attendance-list absent-list">
                  <h5>Participantes Ausentes ({attendanceReport.absentCount})</h5>
                  {attendanceReport.absentParticipants.map(participant => (
                    <div key={participant.id} className="attendance-participant absent">
                      <div className="participant-avatar">
                        <img src={
                          participant.userPhoto 
                            ? (participant.userPhoto.startsWith('data:') ? participant.userPhoto : `data:image/jpeg;base64,${participant.userPhoto}`)
                            : userIcon
                        } alt="User" />
                      </div>
                      <div className="participant-info">
                        <div className="participant-name">
                          {participant.userName}
                          {participant.isCollaborator && (
                            <span className="collaborator-badge">Colaborador</span>
                          )}
                        </div>
                        <div className="participant-email">{participant.userEmail}</div>
                      </div>
                      <div className="presence-status absent">
                        <IoCloseCircleOutline />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default EventDetails;
