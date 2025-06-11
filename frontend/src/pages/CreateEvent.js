import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCreateOutline, IoImageOutline, IoArrowBackOutline } from 'react-icons/io5';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setForm(f => ({ ...f, photo: base64 }));
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
        return;
      }

      if (form.timeFixedEnd <= form.timeFixedStart) {
        setError('O horário de fim deve ser posterior ao horário de início');
        return;
      }

      const selectedDate = new Date(form.dateFixedStart);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError('A data do evento não pode ser no passado');
        return;
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
        photo: form.photo || null
      };

      const result = await EventService.createEvent(eventData);

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
    }  }
    return (
    <>      <Header />
      <div className="page-container">
        <div className="page-main">
          {/* Page Header */}
          <div className="page-header">
            <button 
              className="back-btn" 
              onClick={() => navigate('/main')}
              aria-label="Voltar para a página principal"
            >
              <IoArrowBackOutline />
            </button>
            <div className="header-content">
              <IoCreateOutline className="page-icon" />
              <div className="page-title">
                <h1>Criar Evento</h1>
                <span className="subtitle">Configure seu novo evento</span>
              </div>
            </div>
          </div>

          <div className="content-wrapper">
            <form className="modern-form" onSubmit={handleSubmit}>
              
              {/* Photo Upload Section */}
              <div className="glass-card">
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
                  />
                </label>
              </div>

              {/* Basic Information */}
              <div className="glass-card">
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
                    placeholder="Descreva seu evento..."
                    maxLength={1000}
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="glass-card">
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
                      onChange={handleChange}
                      className="modern-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="glass-card">
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
                      name="acess"
                      value={form.acess}
                      onChange={handleChange}
                      className="modern-select"
                    >
                      <option value="PUBLIC">Público</option>
                      <option value="PRIVATE">Privado</option>
                    </select>
                  </div>
                </div>
              </div>              {/* Status Messages */}
              {error && <div className="status-message status-error">{error}</div>}
              {success && <div className="status-message status-success">{success}</div>}

              {/* Submit Button */}
              <button type="submit" className="modern-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Criando Evento...
                  </>
                ) : 'Criar Evento'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
