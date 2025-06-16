import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import { IoCalendarOutline, IoSearch, IoGridOutline, IoListOutline, IoAddCircleOutline } from 'react-icons/io5';
import './AllEvents.css';
import EventService from '../services/EventService';
import ParticipantService from '../services/ParticipantService';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [filter, setFilter] = useState('all'); // 'all', 'my-events', 'participating'
  const navigate = useNavigate();

  useEffect(() => {
    loadAllEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filter]);

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      
      // Carregar eventos criados pelo usuário
      const myEventsResult = await EventService.getMyEvents();
      const myEvents = myEventsResult.success ? myEventsResult.events.map(event => ({
        ...event,
        userStatus: 'owner',
        source: 'created'
      })) : [];

      // Carregar eventos onde o usuário é participante
      const participatingEventsResult = await EventService.getParticipatingEvents();
      const participatingEvents = participatingEventsResult.success ? participatingEventsResult.events.map(event => ({
        ...event,
        userStatus: event.userStatus || 'participant',
        source: 'participating'
      })) : [];

      // Combinar e remover duplicatas (caso o usuário seja owner e participante)
      const allEvents = [...myEvents];
      participatingEvents.forEach(event => {
        if (!allEvents.find(e => e.id === event.id)) {
          allEvents.push(event);
        }
      });

      // Ordenar por data de criação (mais recentes primeiro)
      allEvents.sort((a, b) => new Date(b.dateCreated || b.createdAt || 0) - new Date(a.dateCreated || a.createdAt || 0));

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filtrar por tipo
    if (filter === 'my-events') {
      filtered = filtered.filter(event => event.source === 'created');
    } else if (filter === 'participating') {
      filtered = filtered.filter(event => event.source === 'participating');
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.localization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleParticipate = async (eventId, success, message) => {
    if (success) {
      // Recarregar eventos para atualizar o status
      await loadAllEvents();
    } else {
      alert(message || 'Erro ao participar do evento');
    }
  };

  const getStatusText = (event) => {
    if (event.state === 'ACTIVE') return 'Ativo';
    if (event.state === 'FINISHED') return 'Encerrado';
    if (event.state === 'CANCELED') return 'Cancelado';
    return 'Criado';
  };

  const getEventIcon = (event) => {
    if (event.userStatus === 'owner') return '👑';
    if (event.userStatus === 'collaborator') return '🤝';
    return '👤';
  };

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <div className="page-title">
              <IoCalendarOutline className="page-icon" />
              <div>
                <h1>Meus Eventos</h1>
                <div className="subtitle">Eventos criados por você e onde você participa</div>
              </div>
            </div>
            
            <button 
              className="modern-btn"
              onClick={() => navigate('/create-event')}
            >
              <IoAddCircleOutline />
              <span>Criar Evento</span>
            </button>
          </div>

          {/* Filtros e busca */}
          <div className="events-controls">
            <div className="search-container">
              <IoSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todos ({events.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'my-events' ? 'active' : ''}`}
                onClick={() => setFilter('my-events')}
              >
                Criados ({events.filter(e => e.source === 'created').length})
              </button>
              <button 
                className={`filter-btn ${filter === 'participating' ? 'active' : ''}`}
                onClick={() => setFilter('participating')}
              >
                Participando ({events.filter(e => e.source === 'participating').length})
              </button>
            </div>

            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Visualização em grade"
              >
                <IoGridOutline />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Visualização em lista"
              >
                <IoListOutline />
              </button>
            </div>
          </div>

          {/* Lista de eventos */}
          <div className="events-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando eventos...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <div className="error-message">{error}</div>
                <button className="retry-btn" onClick={loadAllEvents}>
                  Tentar novamente
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="empty-container">
                <IoCalendarOutline className="empty-icon" />
                <h3>
                  {searchTerm ? 'Nenhum evento encontrado' : 
                   filter === 'my-events' ? 'Você ainda não criou eventos' :
                   filter === 'participating' ? 'Você ainda não participa de eventos' :
                   'Você ainda não tem eventos'}
                </h3>
                <p>
                  {searchTerm ? 'Tente buscar por outros termos' :
                   filter === 'my-events' ? 'Crie seu primeiro evento!' :
                   filter === 'participating' ? 'Participe de eventos públicos ou aceite convites' :
                   'Crie eventos ou participe de eventos existentes'}
                </p>
                {!searchTerm && (
                  <button 
                    className="modern-btn"
                    onClick={() => navigate('/create-event')}
                  >
                    <IoAddCircleOutline />
                    <span>Criar Primeiro Evento</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={`events-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {filteredEvents.map(event => (
                  <div key={event.id} className="event-item">
                    <div className="event-meta">
                      <span className="event-role">
                        {getEventIcon(event)} {event.source === 'created' ? 'Organizador' : 'Participante'}
                      </span>
                      <span className={`event-status status-${event.state?.toLowerCase()}`}>
                        {getStatusText(event)}
                      </span>
                    </div>
                    <EventCard
                      event={event}
                      type="primary"
                      linkTo={`/event/${event.id}`}
                      onParticipate={event.userStatus === 'visitor' ? handleParticipate : null}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllEvents;
