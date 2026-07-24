import UserProvider from './context/UserProvider';
import { RouterProvider } from './routing/Router';
import { useLocation } from './routing/useRouter';
import MainRoute from './routes/MainRoute/MainRoute';
import CallbackRoute from './routes/CallbackRoute/CallbackRoute';
import EulaPage from './pages/EulaPage/EulaPage';
import PrivacyPage from './pages/PrivacyPage/PrivacyPage';
import InstallPage from './pages/InstallPage/InstallPage';
import LoginPage from './pages/LoginPage/LoginPage';

const AppRoutes = () => {
  const location = useLocation();
  const pathname = location.pathname === '/'
    ? '/'
    : location.pathname.replace(/\/+$/, '');

  switch (pathname) {
    case '/':
      return <MainRoute />;
    case '/callback':
      return <CallbackRoute />;
    case '/eula':
      return <EulaPage />;
    case '/privacy':
      return <PrivacyPage />;
    case '/install':
      return <InstallPage />;
    case '/login':
      return <LoginPage />;
    default:
      return null;
  }
};

const App = () => {
  return (
    <UserProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </UserProvider>
  );
};

export default App;
