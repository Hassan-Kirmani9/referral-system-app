import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Organizations } from './pages/Organizations';
import { SendReferral } from './pages/SendReferral';
import { ManageReferrals } from './pages/ManageReferrals';
import { CoverageAreas } from './pages/CoverageAreas';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/organizations" /> : <Login />} />
      <Route
        path="/organizations"
        element={
          <PrivateRoute>
            <Layout>
              <Organizations />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/send-referral"
        element={
          <PrivateRoute>
            <Layout>
              <SendReferral />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/manage-referrals"
        element={
          <PrivateRoute>
            <Layout>
              <ManageReferrals />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/coverage-areas"
        element={
          <PrivateRoute>
            <Layout>
              <CoverageAreas />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/organizations" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;