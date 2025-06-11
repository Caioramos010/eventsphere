import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '../components/Link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { IoArrowBack, IoLocationOutline, IoCalendarOutline, IoTimeOutline, IoLinkOutline, IoCopyOutline, IoCheckmarkOutline } from 'react-icons/io5';
import './Main.css';
import './EventInvite.css';
import eventImg from '../images/event.png';

const EventInvite = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      const mockEvent = {
        id: id,
        name: "ARRATA DO CSRAMOS",
        location: "PRAIA DO PANTANO DO SUL 45",
        date: "25/10/2025",
        time: "14:00 - 22:00",
        image: eventImg
      };

      const mockInviteUrl = `www.eventsphere.com/evento/${id}`;
      
      setEvent(mockEvent);
      setInviteUrl(mockInviteUrl);
      setLoading(false);    }, 1000);
  }, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${inviteUrl}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="main-bg event-invite-container">
          <div className="event-invite-loading">Carregando...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <div className="main-bg event-invite-container">
          <div className="event-invite-error">Evento não encontrado</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="main-bg event-invite-container">        <div className="event-invite-main">
          <div className="invite-card">            <Link to={`/event/${id}`} className="back-btn">
              <IoArrowBack className="back-arrow" />
              <span className="back-text">VOLTAR</span>
            </Link>

            <div className="invite-header">
              <h1 className="invite-title">COPIE O LINK E ENVIE PARA PARTICIPANTES DO EVENTO</h1>
            </div>

            <div className="invite-content">
              <div className="invite-url-section">                <div className="url-display">
                  <span className="url-text">{inviteUrl}</span>
                  <button className="link-icon-btn">
                    <IoLinkOutline className="link-icon" />
                  </button>
                </div>
                  <button 
                  className={`copy-btn ${copySuccess ? 'success' : ''}`}
                  onClick={handleCopyLink}
                >
                  {copySuccess ? <IoCheckmarkOutline className="copy-icon" /> : <IoCopyOutline className="copy-icon" />}
                  <span className="copy-text">
                    {copySuccess ? 'COPIADO!' : 'OU COPIAR LINK'}
                  </span>
                </button>
              </div>

              <div className="event-preview">
                <div className="event-preview-image">
                  <img src={event.image} alt="Evento" className="preview-img" />
                </div>
                <div className="event-preview-info">
                  <h2 className="event-preview-name">{event.name}</h2>                  <div className="event-preview-details">
                    <div className="event-detail-item">
                      <IoLocationOutline className="detail-icon" />
                      <span className="detail-text">{event.location}</span>
                    </div>
                    <div className="event-detail-item">
                      <IoCalendarOutline className="detail-icon" />
                      <span className="detail-text">{event.date}</span>
                    </div>
                    <div className="event-detail-item">
                      <IoTimeOutline className="detail-icon" />
                      <span className="detail-text">{event.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventInvite;
