import UserProvider from './context/UserProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainRoute from './routes/MainRoute/MainRoute';
import CallbackRoute from './routes/CallbackRoute/CallbackRoute';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainRoute />} />
          <Route path="/callback" element={<CallbackRoute />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;