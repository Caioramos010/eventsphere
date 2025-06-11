import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { IoArrowBack, IoQrCodeOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFlashOutline, IoFlashOffOutline, IoCameraReverseOutline } from 'react-icons/io5';
import './QRScanner.css';

const QRScanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  // Mock event data
  const [event] = useState({
    id: id,
    name: "ARRATA DO CSRAMOS",
    location: "PRAIA DO PANTANO DO SUL 45",
    date: "25/10/2025"
  });

  // Mock scanned participants
  const [scannedParticipants, setScannedParticipants] = useState([
    { id: 1, name: "GABRIEL DOS SANTOS", age: 22, status: "HOMEM", scannedAt: "14:25" },
    { id: 2, name: "MARIA SILVA", age: 25, status: "MULHER", scannedAt: "14:30" }
  ]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
      
      setHasCamera(true);
      setIsScanning(true);
    } catch (err) {
      setError('Erro ao acessar a câmera. Verifique as permissões.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const toggleFlash = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          console.error('Flash não suportado:', err);
        }
      }
    }
  };

  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    if (isScanning) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  const handleManualInput = () => {
    const code = prompt('Digite o código do participante:');
    if (code) {
      // Mock scan result
      const mockParticipant = {
        id: Date.now(),
        name: "PARTICIPANTE MANUAL",
        age: 28,
        status: "OUTRO",
        scannedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setScannedParticipants(prev => [mockParticipant, ...prev]);
      setScanResult({ success: true, participant: mockParticipant });
      
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const simulateScan = () => {
    // Simulate a successful scan
    const mockParticipant = {
      id: Date.now(),
      name: "NOVO PARTICIPANTE",
      age: 30,
      status: "HOMEM",
      scannedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setScannedParticipants(prev => [mockParticipant, ...prev]);
    setScanResult({ success: true, participant: mockParticipant });
    
    setTimeout(() => setScanResult(null), 3000);
  };

  const handleBack = () => {
    navigate(`/event/${id}`);
  };

  return (
    <>
      <Header />
      <div className="qr-scanner-container">
        <div className="qr-scanner-main">
          {/* Header */}
          <div className="scanner-header">
            <button className="back-btn" onClick={handleBack}>
              <IoArrowBack />
            </button>
            <div className="scanner-title">
              <IoQrCodeOutline className="scanner-icon" />
              <div>
                <h1>ESCANEAR QR CODE</h1>
                <span>NA TELA</span>
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="event-info-banner">
            <h2>{event.name}</h2>
            <p>{event.location} • {event.date}</p>
          </div>

          {/* Scanner Section */}
          <div className="scanner-section">
            <div className="camera-container">
              {!isScanning ? (
                <div className="camera-placeholder">
                  <IoQrCodeOutline className="placeholder-icon" />
                  <p>Câmera não iniciada</p>
                  <button className="start-camera-btn" onClick={startCamera}>
                    INICIAR CÂMERA
                  </button>
                </div>
              ) : (
                <div className="camera-view">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-video"
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
                  {/* Scan Overlay */}
                  <div className="scan-overlay">
                    <div className="scan-frame">
                      <div className="scan-corner top-left"></div>
                      <div className="scan-corner top-right"></div>
                      <div className="scan-corner bottom-left"></div>
                      <div className="scan-corner bottom-right"></div>
                      <div className="scan-line"></div>
                    </div>
                  </div>

                  {/* Camera Controls */}
                  <div className="camera-controls">
                    <button 
                      className="control-btn" 
                      onClick={toggleFlash}
                      disabled={!stream}
                    >
                      {flashEnabled ? <IoFlashOffOutline /> : <IoFlashOutline />}
                    </button>
                    <button className="control-btn" onClick={switchCamera}>
                      <IoCameraReverseOutline />
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <IoCloseCircleOutline />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Manual Input Button */}
            <button className="manual-input-btn" onClick={handleManualInput}>
              OU DIGITE O CÓDIGO
            </button>

            {/* Demo Scan Button */}
            <button className="demo-scan-btn" onClick={simulateScan}>
              SIMULAR SCAN (DEMO)
            </button>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
              <div className="result-icon">
                {scanResult.success ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
              </div>
              <div className="result-text">
                {scanResult.success ? (
                  <>
                    <h3>Participante Confirmado!</h3>
                    <p>{scanResult.participant.name}</p>
                  </>
                ) : (
                  <>
                    <h3>Código Inválido</h3>
                    <p>Participante não encontrado</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Scanned Participants */}
          <div className="scanned-participants">
            <h3>PARTICIPANTES ESCANEADOS - {scannedParticipants.length}</h3>
            <div className="participants-list">
              {scannedParticipants.map(participant => (
                <div key={participant.id} className="participant-item">
                  <div className="participant-info">
                    <span className="participant-name">{participant.name}</span>
                    <span className="participant-details">{participant.age} • {participant.status}</span>
                  </div>
                  <span className="scan-time">{participant.scannedAt}</span>
                  <IoCheckmarkCircleOutline className="status-icon success" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QRScanner;
