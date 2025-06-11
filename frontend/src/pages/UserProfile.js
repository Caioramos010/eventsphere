import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoArrowBack, IoCamera, IoTrash, IoSave } from 'react-icons/io5';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import './UserProfile.css';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('photo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const userData = AuthService.getCurrentUser();
    if (userData) {
      setUser(userData);
      setForm(prevForm => ({
        ...prevForm,
        name: userData.name || '',
        email: userData.email || '',
        username: userData.username || ''
      }));
      
      // Set photo preview if user has a photo
      if (userData.photo) {
        setPhotoPreview(userData.photo);
      }
    }
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setSuccess('');
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(user?.photo || '');
    // Clear file input
    const fileInput = document.getElementById('photo-input');
    if (fileInput) fileInput.value = '';
    setError('');
    setSuccess('');
  }

  async function handleUploadPhoto() {
    if (!photoFile) {
      setError('Selecione uma foto para fazer o upload');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await UserService.uploadUserPhoto(photoFile);
      
      if (result.success) {
        setSuccess('Foto atualizada com sucesso!');
        // Update local user data
        const updatedUser = { ...user, photo: result.photoUrl };
        setUser(updatedUser);
        AuthService.updateCurrentUser(updatedUser);
        // Clear file input but keep preview
        setPhotoFile(null);
        const fileInput = document.getElementById('photo-input');
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.message || 'Erro ao fazer upload da foto');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEmail(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!form.email || form.email === user.email) {
        setError('Digite um novo email válido');
        return;
      }

      const result = await UserService.updateEmail(form.email);

      if (result.success) {
        setSuccess(result.message || 'Email atualizado com sucesso!');
        // Atualizar dados locais
        const updatedUser = { ...user, email: form.email };
        setUser(updatedUser);
        AuthService.updateCurrentUser(updatedUser);
      } else {
        setError(result.message || 'Erro ao atualizar email');
      }
    } catch (err) {
      console.error('Update email error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUsername(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!form.username || form.username === user.username) {
        setError('Digite um novo login válido');
        return;
      }

      const result = await UserService.updateUsername(form.username);

      if (result.success) {
        setSuccess(result.message || 'Login atualizado com sucesso!');
        // Atualizar dados locais
        const updatedUser = { ...user, username: form.username };
        setUser(updatedUser);
        AuthService.updateCurrentUser(updatedUser);
      } else {
        setError(result.message || 'Erro ao atualizar login');
      }
    } catch (err) {
      console.error('Update username error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setError('Preencha todos os campos de senha');
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        setError('A nova senha e confirmação não coincidem');
        return;
      }

      if (form.newPassword.length < 8) {
        setError('A nova senha deve ter pelo menos 8 caracteres');
        return;
      }

      // Validação de senha forte
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
      if (!passwordRegex.test(form.newPassword)) {
        setError('A nova senha deve conter: maiúscula, minúscula, número e caractere especial');
        return;
      }

      const result = await UserService.updatePassword(form.currentPassword, form.newPassword);

      if (result.success) {
        setSuccess(result.message || 'Senha atualizada com sucesso!');
        // Limpar campos de senha
        setForm(prevForm => ({
          ...prevForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        setError(result.message || 'Erro ao atualizar senha');
      }
    } catch (err) {
      console.error('Update password error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }
  if (!user) {
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
              <IoPersonOutline className="page-icon" />
              <div>
                <h1>Perfil do Usuário</h1>
                <div className="subtitle">Gerencie suas informações</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="profile-tabs">
              <button 
                className={`profile-tab ${activeTab === 'photo' ? 'active' : ''}`}
                onClick={() => setActiveTab('photo')}
              >
                Foto
              </button>
              <button 
                className={`profile-tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
              >
                Email
              </button>
              <button 
                className={`profile-tab ${activeTab === 'username' ? 'active' : ''}`}
                onClick={() => setActiveTab('username')}
              >
                Login
              </button>
              <button 
                className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                Senha
              </button>
            </div>
            
            {/* Photo Tab */}
            {activeTab === 'photo' && (              <div className="profile-form">                <div className="photo-container">
                  <div className="photo-wrapper">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Foto de perfil" className="profile-photo" />
                    ) : (
                      <div className="photo-placeholder">
                        <IoPersonOutline size={60} />
                      </div>
                    )}                  </div>
                    <div style={{ position: 'relative', marginTop: '-50px', marginLeft: '110px', marginBottom: '35px', zIndex: 30 }} className="photo-upload-container">
                    <label htmlFor="photo-input" className="photo-upload-btn">
                      <IoCamera size={24} />
                    </label>
                  </div>
                    <input 
                      type="file" 
                      id="photo-input"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div className="photo-actions">
                    <button 
                      className="modern-btn-secondary photo-action-btn"
                      onClick={handleRemovePhoto}
                      disabled={loading || (!photoFile && !photoPreview)}
                    >
                      <IoTrash size={16} />
                      Remover
                    </button>
                    <button 
                      className="modern-btn photo-action-btn"
                      onClick={handleUploadPhoto}
                      disabled={loading || !photoFile}
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <IoSave size={16} />
                          Salvar foto
                        </>
                      )}
                    </button>
                  </div>
                  <div className="photo-info">
                    <small>
                      A foto deve ter no máximo 5MB. Formatos aceitos: JPG, PNG, GIF
                    </small>
                  </div>
                </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <form onSubmit={handleUpdateEmail} className="profile-form">
                <div className="form-group">
                  <label className="modern-label">Email Atual</label>
                  <input
                    type="text"
                    value={user.email}
                    className="modern-input"
                    disabled
                    style={{opacity: 0.7}}
                  />
                </div>
                <div className="form-group">
                  <label className="modern-label">Novo Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Digite o novo email"
                    required
                  />
                </div>
                <button 
                  className="modern-btn" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <div className="loading-spinner" />}
                  {loading ? 'Atualizando...' : 'Atualizar Email'}
                </button>
              </form>
            )}

            {/* Username Tab */}
            {activeTab === 'username' && (
              <form onSubmit={handleUpdateUsername} className="profile-form">
                <div className="form-group">
                  <label className="modern-label">Login Atual</label>
                  <input
                    type="text"
                    value={user.username}
                    className="modern-input"
                    disabled
                    style={{opacity: 0.7}}
                  />
                </div>
                <div className="form-group">
                  <label className="modern-label">Novo Login *</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Digite o novo login"
                    required
                  />
                </div>
                <button 
                  className="modern-btn" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <div className="loading-spinner" />}
                  {loading ? 'Atualizando...' : 'Atualizar Login'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword} className="profile-form">
                <div className="form-group">
                  <label className="modern-label">Senha Atual *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Digite sua senha atual"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="modern-label">Nova Senha *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Digite a nova senha"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="modern-label">Confirmar Nova Senha *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Confirme a nova senha"
                    required
                  />
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-gray-light)',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial (@$!%*?&)
                </div>
                <button 
                  className="modern-btn" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <div className="loading-spinner" />}
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </form>
            )}

            {/* Status Messages */}
            {error && <div className="status-message status-error">{error}</div>}
            {success && <div className="status-message status-success">{success}</div>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
