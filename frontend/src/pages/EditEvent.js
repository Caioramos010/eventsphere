import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoCreateOutline, IoImageOutline } from 'react-icons/io5';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageTitle, StandardButton, StandardCard, BackButton } from '../components';
import './Main.css';
import './CreateEvent.css';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
    const [form, setForm] = useState({
    name: '',
    dateFixedStart: '',
    dateFixedEnd: '',
    timeFixedStart: '',
    timeFixedEnd: '',
    localization: '',
    description: '',
    maxParticipants: 50,
    classification: 0,
    acess: 'PUBLIC',
    photo: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  
  useEffect(() => {
    async function loadEvent() {
      try {        setTimeout(() => {
          const mockEvent = {
            name: 'Evento Exemplo',
            dateFixedStart: '2025-06-15',
            dateFixedEnd: '2025-06-15',
            timeFixedStart: '14:00',
            timeFixedEnd: '18:00',
            localization: 'Centro de Convenções',
            description: 'Descrição do evento exemplo...',
            maxParticipants: 100,
            classification: 18,
            acess: 'PUBLIC',
            photo: null
          };
          
          setForm(mockEvent);
          setLoadingEvent(false);
        }, 800);
      } catch (err) {
        setError('Erro ao carregar evento');
        setLoadingEvent(false);
      }
    }
    
    if (id) {
      loadEvent();
    }
  }, [id]);

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm(f => ({ ...f, photo: files[0] }));
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      
      
      
      
      
      
      setTimeout(() => {
        setLoading(false);
        setSuccess('Evento atualizado com sucesso!');
        setTimeout(() => {
          navigate('/main'); 
        }, 1500);
      }, 1200);
    } catch (err) {
      setLoading(false);
      setError('Erro ao atualizar evento');
    }
  }
  if (loadingEvent) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">            <div className="page-header">
              <BackButton 
                onClick={() => navigate(`/event/${id}`)}
                icon={IoArrowBackOutline}
                aria-label="Voltar para detalhes do evento"
              />
              <div className="header-content">
                <h1>Editar Evento</h1>
                <div className="subtitle">Carregando dados...</div>
              </div>
            </div>
            
            <div className="glass-card">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="loading-spinner"></div>
                <p>Carregando dados do evento...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">          <div className="page-header">
            <BackButton 
              onClick={() => navigate(`/event/${id}`)}
              icon={IoArrowBackOutline}
              aria-label="Voltar para detalhes do evento"
            />
            
            <PageTitle
              icon={IoCreateOutline}
              title="Editar Evento"
              subtitle="Atualize as informações do seu evento"
              description="Modifique dados, datas e configurações do evento"
            />
          </div>
          
          <form className="modern-form" onSubmit={handleSubmit}>
            {/* Photo Upload Section */}
              <StandardCard variant="glass" padding="large">
                <label className="upload-area" htmlFor="photo-input">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <IoImageOutline className="upload-icon" />
                    </div>
                  )}
                  <div className="upload-text">
                    {photoPreview ? 'Clique para alterar a foto' : 'Clique para adicionar uma foto'}
                  </div>
                  <input
                    id="photo-input"
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden-input"
                  />                </label>
              </StandardCard>

           <StandardCard variant="glass" padding="large">
                           <h3 className="card-title">Informações Básicas</h3>
                           
                           <div className="form-group">
                             <label className="modern-label">Nome do Evento *</label>
                             <input
                               type="text"
                               name="name"
                               value={form.name}
                               onChange={handleChange}
                               className="modern-input"
                               placeholder="Digite o nome do seu evento"
                               required
                             />
                           </div>
           
                           <div className="form-group">
                             <label className="modern-label">Local *</label>
                             <input
                               type="text"
                               name="localization"
                               value={form.localization}
                               onChange={handleChange}
                               className="modern-input"
                               placeholder="Digite o local do evento"
                               required
                             />
                           </div>
           
                           <div className="form-group">
                             <label className="modern-label">Descrição</label>
                             <textarea
                               name="description"
                               value={form.description}
                               onChange={handleChange}
                               className="modern-textarea"
                               placeholder="Descreva seu evento..."                    maxLength={1000}
                             />
                           </div>
                         </StandardCard>
           
                         {/* Date and Time */}
                         <StandardCard variant="glass" padding="large">
                           <h3 className="card-title">Data e Horário</h3>
                           
                           <div className="form-row">
                             <div className="form-group">
                               <label className="modern-label">Data de Início *</label>                    <input
                                 type="date"
                                 name="dateFixedStart"
                                 value={form.dateFixedStart}
                                 onChange={handleChange}
                                 className="modern-input"
                                 min={getTodayDateString()}
                                 required
                               />
                             </div>
                             
                             <div className="form-group">
                               <label className="modern-label">Data de Fim</label>                    <input
                                 type="date"
                                 name="dateFixedEnd"
                                 value={form.dateFixedEnd}
                                 onChange={handleChange}
                                 className="modern-input"
                                 min={form.dateFixedStart || getTodayDateString()}
                               />
                             </div>
                           </div>
           
                           <div className="form-row">
                             <div className="form-group">
                               <label className="modern-label">Horário de Início *</label>
                               <input
                                 type="time"
                                 name="timeFixedStart"
                                 value={form.timeFixedStart}
                                 onChange={handleChange}
                                 className="modern-input"
                                 required
                               />
                             </div>
                             
                             <div className="form-group">
                               <label className="modern-label">Horário de Fim *</label>
                               <input
                                 type="time"
                                 name="timeFixedEnd"
                                 value={form.timeFixedEnd}
                                 onChange={handleChange}                      className="modern-input"
                                 required
                               />
                             </div>
                           </div>
                         </StandardCard>
           
                         {/* Settings */}
                         <StandardCard variant="glass" padding="large">
                           <h3 className="card-title">Configurações</h3>
                           
                           <div className="form-row-three">
                             <div className="form-group">
                               <label className="modern-label">Limite de Participantes *</label>
                               <input
                                 type="number"
                                 name="maxParticipants"
                                 value={form.maxParticipants}
                                 onChange={handleChange}
                                 className="modern-input"
                                 min="1"
                                 required
                               />
                             </div>
                             
                             <div className="form-group">
                               <label className="modern-label">Classificação Etária</label>
                               <select
                                 name="classification"
                                 value={form.classification}
                                 onChange={handleChange}
                                 className="modern-select"
                               >
                                 <option value={0}>Livre</option>
                                 <option value={10}>10 anos</option>
                                 <option value={12}>12 anos</option>
                                 <option value={14}>14 anos</option>
                                 <option value={16}>16 anos</option>
                                 <option value={18}>18 anos</option>
                               </select>
                             </div>
                             
                             <div className="form-group">
                               <label className="modern-label">Acesso</label>
                               <select
                                 name="acess"                      value={form.acess}
                                 onChange={handleChange}
                                 className="modern-select"
                               >
                                 <option value="PUBLIC">Público</option>
                                 <option value="PRIVATE">Privado</option>
                               </select>
                             </div>
                           </div>
                         </StandardCard>
            {error && <div className="status-message status-error">{error}</div>}
            {success && <div className="status-message status-success">{success}</div>}
            
            <StandardButton 
              type="submit" 
              variant="primary"
              size="large"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </StandardButton>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
