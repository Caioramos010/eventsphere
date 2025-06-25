import './App.css';
import AppRouter from './AppRouter';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <AppRouter />
    </UserProvider>
  );
}

export default App;