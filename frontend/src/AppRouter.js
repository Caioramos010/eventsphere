import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main'
import CreateEvent from './pages/CreateEvent';
import JoinEvent from './pages/JoinEvent';
import UserProfile from './pages/UserProfile';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import EventInvite from './pages/EventInvite';
import QRScanner from './pages/QRScanner';
import Settings from './pages/Settings';
import AllEvents from './pages/AllEvents';
import ProtectedRoute from './components/ProtectedRoute';
import InviteRedirect from './components/InviteRedirect';

function AppRouter() {
  return (
    <Router>      
      <Routes>        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas protegidas */}        <Route path='/main' element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        } />
        <Route path='/eventos' element={
          <ProtectedRoute>
            <AllEvents />
          </ProtectedRoute>
        } /><Route path='/create-event' element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        } />        <Route path='/event/enter' element={
          <ProtectedRoute>
            <JoinEvent />
          </ProtectedRoute>
        } />        <Route path='/join-event/:token' element={
          <ProtectedRoute>
            <JoinEvent />
          </ProtectedRoute>
        } />
        {/* Rota para redirecionamento de convites */}
        <Route path='/invite/:token' element={<InviteRedirect />} />
        <Route path='/profile' element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path='/event/:id' element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        } />
        <Route path='/event/:id/invite' element={
          <ProtectedRoute>
            <EventInvite />
          </ProtectedRoute>
        } />        <Route path='/event/:id/qr-scanner' element={
          <ProtectedRoute>
            <QRScanner />
          </ProtectedRoute>
        } />
        <Route path='/edit-event/:id' element={
          <ProtectedRoute>
            <EditEvent />
          </ProtectedRoute>
        } />
        <Route path='/configuracoes' element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default AppRouter;
