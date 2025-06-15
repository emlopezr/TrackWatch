import UserProvider from './context/UserProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainRoute from './routes/MainRoute/MainRoute';
import CallbackRoute from './routes/CallbackRoute/CallbackRoute';
import EulaPage from './pages/EulaPage/EulaPage';
import PrivacyPage from './pages/PrivacyPage/PrivacyPage';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainRoute />} />
          <Route path="/callback" element={<CallbackRoute />} />
          <Route path="/eula" element={<EulaPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;