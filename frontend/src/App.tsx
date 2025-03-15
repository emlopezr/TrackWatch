import UserProvider from './context/UserProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import CallbackPage from './pages/CallbackPage/CallbackPage';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/callback" element={<CallbackPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;