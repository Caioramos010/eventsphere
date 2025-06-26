import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BackButton } from '../components';
import { IoQrCodeOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFlashOutline, IoFlashOffOutline, IoCameraReverseOutline } from 'react-icons/io5';
import { BrowserQRCodeReader } from '@zxing/library';
import ParticipantService from '../services/ParticipantService';
import './QRScanner.css';

// Função utilitária para validar o formato participantId:token
function isValidPresenceCode(code) {
  if (typeof code !== 'string') return false;
  const parts = code.split(':');
  return parts.length === 2 && /^\d+$/.test(parts[0]) && parts[1].trim() !== '';
}

const QRScanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

useEffect(() => {
  initializeCamera();
}, []);

useEffect(() => {
  loadEventData();
}, []);

useEffect(() => {
  return () => cleanup();
}, []);

  const cleanup = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const initializeCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Seu navegador não suporta acesso à câmera');
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setError('Nenhuma câmera encontrada neste dispositivo');
        return;
      }
      setAvailableCameras(videoDevices);
      setHasCamera(true);
      readerRef.current = new BrowserQRCodeReader();
    } catch (err) {
      setError('Erro ao verificar câmeras disponíveis');
    }
  };

  const loadEventData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/event/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data.data);
      } else {
        setError('Erro ao carregar dados do evento');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setError(null);
      if (!videoRef.current) {
        setError('Elemento de vídeo não encontrado');
        return;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      let constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30 }
        }
      };
      if (facingMode) constraints.video.facingMode = facingMode;
      if (availableCameras.length > 0 && currentCameraIndex >= 0 && availableCameras[currentCameraIndex]) {
        constraints.video.deviceId = { exact: availableCameras[currentCameraIndex].deviceId };
      }
      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.style.display = 'block';
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true;
      await new Promise((resolve, reject) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(resolve).catch(reject);
        };
        setTimeout(() => reject(new Error('Timeout ao carregar vídeo')), 10000);
      });
      setIsScanning(true);
      if (!readerRef.current) readerRef.current = new BrowserQRCodeReader();
      startContinuousScanning();
    } catch (err) {
      setError('Erro ao acessar a câmera.');
      setIsScanning(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const startContinuousScanning = () => {
    if (!readerRef.current || !videoRef.current) return;
    const scanFrame = async () => {
      if (!isScanning || !videoRef.current || !readerRef.current) return;
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const result = await readerRef.current.decodeFromImageElement(canvas);
        if (result && result.text) {
          handleScanSuccess(result.text);
        }
      } catch (err) {
        // NotFoundException é esperado quando não há QR
      }
    };
    scanIntervalRef.current = setInterval(scanFrame, 500);
  };

  const stopScanner = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch (e) {}
    }
  };

  const handleScanSuccess = async (qrCodeData) => {
    try {
      const cleanData = qrCodeData.trim();
      await handleMarkPresenceByQR(cleanData);
    } catch (err) {
      setScanResult({ success: false, message: 'Erro ao processar QR code' });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const handleMarkPresenceByQR = async (code) => {
    try {
      if (!isValidPresenceCode(code)) {
        setScanResult({ success: false, message: 'Formato do QR code inválido. Use participantId:token' });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }
      const result = await ParticipantService.markPresenceByQR(code);
      setScanResult({ success: result.success, message: result.message });
      if (result.success) loadEventData();
    } catch (err) {
      setScanResult({ success: false, message: 'Erro ao marcar presença' });
    }
    setTimeout(() => setScanResult(null), 3000);
  };

  const handleManualInput = async () => {
    const code = prompt('Digite o código manual do participante:');
    if (code && code.trim()) {
      const manualCode = code.trim();
      if (!isValidPresenceCode(manualCode)) {
        setScanResult({ success: false, message: 'Formato inválido.' });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }
      try {
        const result = await ParticipantService.markPresenceByCode(id, manualCode);
        setScanResult({ success: result.success, message: result.message });
        if (result.success) loadEventData();
      } catch (err) {
        setScanResult({ success: false, message: 'Erro ao marcar presença manualmente' });
      }
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const handleBack = () => {
    navigate(`/event/${id}`);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="qr-scanner-container">
          <div className="loading-container">
            <p>Carregando...</p>
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
        <div className="qr-scanner-container">
          <div className="error-container">
            <p>Evento não encontrado</p>
            <button onClick={handleBack}>Voltar</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const participants = event.participants || [];
  const presentCount = participants.filter(p => p.status === 'PRESENT').length;
  const totalCount = participants.length;

  return (
    <>
      <Header />
      <div className="qr-scanner-container">
        <div className="qr-scanner-main">
          <div className="scanner-header">
            <BackButton onClick={handleBack} />
            <div className="scanner-title">
              <IoQrCodeOutline className="scanner-icon" />
              <div>
                <h1>ESCANEAR QR CODE</h1>
                <span>NA TELA</span>
              </div>
            </div>
          </div>
          <div className="event-info-banner">
            <h2>{event.title || event.name}</h2>
            <p>{event.location || event.localization || 'Local não informado'}</p>
          </div>
          <div className="scanner-section">
            <div className="camera-container">
              <div className="camera-view">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    display: isScanning ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {!isScanning && (
                  <div className="camera-placeholder">
                    <IoQrCodeOutline className="placeholder-icon" />
                    <p>Câmera não iniciada</p>
                    {availableCameras.length > 0 && (
                      <p className="camera-info">
                        {availableCameras.length} câmera(s) detectada(s)
                        <br />
                        Atual: {currentCameraIndex >= 0 && availableCameras[currentCameraIndex] ?
                          (availableCameras[currentCameraIndex].label || `Câmera ${currentCameraIndex + 1}`) :
                          'Nenhuma selecionada'}
                      </p>
                    )}
                    <button
                      className="start-camera-btn"
                      onClick={startScanner}
                      disabled={!hasCamera}
                    >
                      {hasCamera ? 'INICIAR CÂMERA' : 'CÂMERA INDISPONÍVEL'}
                    </button>
                  </div>
                )}
                {isScanning && (
                  <>
                    <div className="scan-overlay">
                      <div className="scan-frame">
                        <div className="scan-corner top-left"></div>
                        <div className="scan-corner top-right"></div>
                        <div className="scan-corner bottom-left"></div>
                        <div className="scan-corner bottom-right"></div>
                        <div className="scan-line"></div>
                      </div>
                    </div>
                    <div className="camera-controls">
                      <button
                        className="control-btn"
                        onClick={() => setFlashEnabled(!flashEnabled)}
                        disabled={!streamRef.current}
                        title="Toggle Flash"
                      >
                        {flashEnabled ? <IoFlashOffOutline /> : <IoFlashOutline />}
                      </button>
                      <button
                        className="control-btn"
                        onClick={() => setCurrentCameraIndex((currentCameraIndex + 1) % availableCameras.length)}
                        disabled={availableCameras.length <= 1}
                        title={`Switch Camera (${currentCameraIndex + 1}/${availableCameras.length})`}
                      >
                        <IoCameraReverseOutline />
                      </button>
                      <button
                        className="control-btn stop-btn"
                        onClick={stopScanner}
                        title="Stop Camera"
                      >
                        <IoCloseCircleOutline />
                      </button>
                    </div>
                  </>
                )}
              </div>
              {error && (
                <div className="error-message">
                  <IoCloseCircleOutline />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <button className="manual-input-btn" onClick={handleManualInput}>
              OU DIGITE O CÓDIGO
            </button>
          </div>
          {scanResult && (
            <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
              <div className="result-icon">
                {scanResult.success ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
              </div>
              <div className="result-text">
                <h3>{scanResult.message || (scanResult.success ? 'Participante Confirmado!' : 'Código inválido')}</h3>
              </div>
            </div>
          )}
          <div className="participants-list">
            <div className="participants-header">
              <span>Participantes presentes: {presentCount} / {totalCount}</span>
            </div>
            {presentCount === 0 ? (
              <p className="no-participants">Nenhum participante presente</p>
            ) : (
              participants
                .filter(participant => participant.status === 'PRESENT')
                .map(participant => (
                  <div key={participant.id} className="participant-item present">
                    <div className="participant-info">
                      <span className="participant-name">{participant.userName || 'Sem nome'}</span>
                      <span className="participant-email">{participant.userEmail || ''}</span>
                      {participant.isCollaborator && <span className="participant-collaborator">Colaborador</span>}
                    </div>
                    <div className="participant-status">
                      <IoCheckmarkCircleOutline className="status-icon success" title="Presente" />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QRScanner;