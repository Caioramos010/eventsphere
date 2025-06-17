import React, { useEffect, useState } from 'react';
import './Main.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from '../components/Link';
import { PageTitle, StandardButton, StandardCard } from '../components';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import EventCard from '../components/EventCard';
// React Icons imports
import { FaCalendarAlt, FaCrown, FaUserFriends } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs';
import { MdPublic, MdLock } from 'react-icons/md';
import { IoGridOutline } from 'react-icons/io5';

function Main() {  
  const [myEvents, setMyEvents] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    // Verificar se usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Carregar dados dos eventos
    loadEvents();
  }, [navigate]);  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Carregar meus eventos e eventos públicos em paralelo
      const [myEventsResult, publicEventsResult] = await Promise.all([
        EventService.getMyEvents(),
        EventService.getPublicEvents()
      ]);

      if (myEventsResult.success) {
        console.log('Meus eventos carregados:', myEventsResult.events);
        // Filtrar eventos sem ID (embora agora eles devem ter IDs temporários)
        const validMyEvents = myEventsResult.events.filter(event => {
          if (!event.id) {
            console.warn('Evento ainda sem ID após processamento:', event);
            return false;
          }
          return true;
        });
        
        // Armazenar eventos no cache local para uso posterior
        try {
          localStorage.setItem('myEventsCache', JSON.stringify(validMyEvents));
        } catch (e) {
          console.error('Erro ao salvar cache de eventos:', e);
        }
        
        setMyEvents(validMyEvents);
      } else {
        console.error('Error loading my events:', myEventsResult.message);
      }

      if (publicEventsResult.success) {
        console.log('Eventos públicos carregados:', publicEventsResult.events);
        // Filtrar eventos sem ID (embora agora eles devem ter IDs temporários)
        const validPublicEvents = publicEventsResult.events.filter(event => {
          if (!event.id) {
            console.warn('Evento público ainda sem ID após processamento:', event);
            return false;
          }
          return true;
        });
        
        // Armazenar eventos no cache local para uso posterior
        try {
          localStorage.setItem('publicEventsCache', JSON.stringify(validPublicEvents));
        } catch (e) {
          console.error('Erro ao salvar cache de eventos públicos:', e);
        }
        
        setPublicEvents(validPublicEvents);
      } else {
        console.error('Error loading public events:', publicEventsResult.message);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');  };  
    return (
    <>
      <Header />
      <div className="main-container">
        <div className="main-content">
          {/* Cabeçalho da página */}
          <div className="page-header">
            <PageTitle
              icon={IoGridOutline}
              title="Painel Principal"
              subtitle="Gerencie seus eventos"
              description="Visualize, crie e participe de eventos"
              size="medium"
            />
          </div>
            {/* Calendário e Ações */}
          <StandardCard variant="glass" padding="large" className="main-top-card">
            <div className="main-top-section">
              <Calendar events={[...myEvents, ...publicEvents]} />               <div className="actions-section">
                <h3 className="actions-title">Ações Rápidas</h3>                
                <Link to="/event/enter">
                  <StandardButton
                    variant="secondary"
                    size="large"
                    icon={FaCalendarAlt}
                    className="action-btn main-action-btn"
                  >
                    PARTICIPAR DE UM EVENTO
                  </StandardButton>
                </Link>
                
                <Link to="/create-event">
                  <StandardButton
                    variant="primary"
                    size="large"
                    icon={FaCalendarAlt}
                    className="action-btn main-action-btn"
                  >
                    CRIAR EVENTO
                  </StandardButton>
                </Link>
              </div>
            </div>
          </StandardCard>          {/* Meus Eventos */}
          <section className="events-section">
            <StandardCard variant="glass" padding="large">
              <div className="section-header">
                <div className="section-title">
                  <MdLock className="section-icon" />
                  <span>MEUS EVENTOS</span>
                </div>
                <div className="search-row">
                  <input 
                    className="modern-input search-input" 
                    placeholder="Pesquise pelo nome, descrição ou local do evento..." 
                  />
                </div>
              </div>
                <div className="events-grid">
                {loading ? (
                  <div className="loading-message">Carregando...</div>
                ) : error ? (
                  <div className="status-message status-error">{error}</div>                ) : myEvents.length === 0 ? (
                  <div className="empty-message">Nenhum evento encontrado</div>
                ) : (
                  myEvents.filter(ev => !!ev.id).map(ev => (
                    <EventCard 
                      key={ev.id} 
                      event={ev}                      type="primary" 
                      linkTo={`/event/${ev.id}`} 
                    />
                  ))
                )}
              </div>
            </StandardCard>
          </section>          {/* Eventos Públicos */}
          <section className="events-section">
            <StandardCard variant="glass" padding="large">
              <div className="section-header">
                <div className="section-title">
                  <MdPublic className="section-icon" />
                  <span>EVENTOS PÚBLICOS</span>
                </div>
                <div className="search-row">
                  <input 
                    className="modern-input search-input" 
                    placeholder="Pesquise pelo nome, descrição ou local do evento..." 
                  />
                </div>
              </div>
                <div className="events-grid">
                {loading ? (
                  <div className="loading-message">Carregando...</div>
                ) : error ? (
                  <div className="status-message status-error">{error}</div>                ) : publicEvents.length === 0 ? (
                  <div className="empty-message">Nenhum evento público encontrado</div>
                ) : (
                  publicEvents.filter(ev => !!ev.id).map(ev => (
                    <EventCard                      key={ev.id} 
                      event={ev} 
                      type="secondary" 
                      linkTo={`/event/${ev.id}`} 
                    />
                  ))
                )}
              </div>
            </StandardCard>
          </section>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default Main;