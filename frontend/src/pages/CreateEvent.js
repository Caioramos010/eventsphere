import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCreateOutline, IoImageOutline, IoArrowBackOutline } from 'react-icons/io5';
import { Header, Footer, PageTitle, StandardButton, StandardCard, BackButton } from '../components';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import './CreateEvent.css';

export default function CreateEvent() {
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);
  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files[0]) {
      const file = files[0];
      
      setForm(f => ({ ...f, photoFile: file }));
      
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setPhotoPreview(base64);
      };
      reader.readAsDataURL(file);
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
      if (!form.name || !form.dateFixedStart || !form.timeFixedStart || !form.timeFixedEnd || !form.localization) {
        setError('Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      
      const startDate = form.dateFixedStart;
      const endDate = form.dateFixedEnd || form.dateFixedStart;
      const startDateTime = new Date(`${startDate}T${form.timeFixedStart}`);
      const endDateTime = new Date(`${endDate}T${form.timeFixedEnd}`);

      
      if (startDate === endDate && endDateTime <= startDateTime) {
        setError('O horário de término deve ser posterior ao horário de início para eventos no mesmo dia');
        setLoading(false);
        return;
      }
      
      if (endDateTime < startDateTime && endDate !== startDate) {
        setError('A data/hora de término deve ser posterior à data/hora de início');
        setLoading(false);
        return;
      }

      
      const selectedDate = new Date(form.dateFixedStart + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() < today.getTime()) {
        setError('A data do evento não pode ser no passado');
        setLoading(false);
        return;
      }
      
      const now = new Date();
      if (
        selectedDate.getTime() === today.getTime() &&
        form.timeFixedStart
      ) {
        const [h, m] = form.timeFixedStart.split(':');
        const eventStart = new Date(selectedDate);
        eventStart.setHours(Number(h), Number(m), 0, 0);
        if (eventStart < now) {
          setError('O horário de início deve ser igual ou posterior ao horário atual');
          setLoading(false);
          return;
        }
      }

      
      const eventData = {
        name: form.name,
        dateFixedStart: form.dateFixedStart,
        dateFixedEnd: form.dateFixedEnd || form.dateFixedStart,
        timeFixedStart: form.timeFixedStart,
        timeFixedEnd: form.timeFixedEnd,
        localization: form.localization,
        description: form.description,
        maxParticipants: parseInt(form.maxParticipants) || 50,
        classification: parseInt(form.classification) || 0,
        acess: form.acess,
        photo: null 
      };

      
      const result = await EventService.createEvent(eventData);

      if (result.success && form.photoFile) {
        
        try {
          await EventService.uploadEventPhoto(result.event.id, form.photoFile);
          console.log('Photo uploaded successfully');
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          
        }
      }

      if (result.success) {
        setSuccess(result.message || 'Evento criado com sucesso!');
        setTimeout(() => {
          navigate('/main');
        }, 2000);
      } else {
        setError(result.message || 'Erro ao criar evento');
      }
    } catch (err) {
      console.error('Create event error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }
    return (
    <>      <Header />
      <div className="page-container">
        <div className="page-main">
          {/* Page Header */}          <div className="page-header">            <BackButton 
              onClick={() => navigate('/main')}
              icon={IoArrowBackOutline}
            />
            
            <PageTitle
              icon={IoCreateOutline}
              title="Criar Evento"
              subtitle="Configure seu novo evento"
              description="Preencha as informações abaixo para criar um novo evento"
            />
          </div>

          <div className="content-wrapper">
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

              {/* Basic Information */}
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
                    <label className="modern-label">Data de Início *</label>
                    <input
                      type="date"
                      name="dateFixedStart"
                      value={form.dateFixedStart}
                      onChange={handleChange}
                      className="modern-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="modern-label">Data de Fim</label>
                    <input
                      type="date"
                      name="dateFixedEnd"
                      value={form.dateFixedEnd}
                      onChange={handleChange}
                      className="modern-input"
                      min={form.dateFixedStart || new Date().toISOString().split('T')[0]}
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
              
              {/* Status Messages */}
              {error && <div className="status-message status-error">{error}</div>}
              {success && <div className="status-message status-success">{success}</div>}

              {/* Submit Button */}              <StandardButton
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Criando Evento...' : 'Criar Evento'}
              </StandardButton>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
