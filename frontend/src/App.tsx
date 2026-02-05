import UserProvider from './context/UserProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainRoute from './routes/MainRoute/MainRoute';
import CallbackRoute from './routes/CallbackRoute/CallbackRoute';
import EulaPage from './pages/EulaPage/EulaPage';
import PrivacyPage from './pages/PrivacyPage/PrivacyPage';
import InstallPage from './pages/InstallPage/InstallPage';
import LoginPage from './pages/LoginPage/LoginPage';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainRoute />} />
          <Route path="/callback" element={<CallbackRoute />} />
          <Route path="/eula" element={<EulaPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;