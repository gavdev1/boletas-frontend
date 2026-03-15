import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AlumnosManagement from './pages/AlumnosManagement';
import MateriasManagement from './pages/MateriasManagement';
import BoletaManagement from './pages/BoletaManagement';
import ConfiguracionManagement from './pages/ConfiguracionManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/alumnos" element={
              <ProtectedRoute>
                <AlumnosManagement />
              </ProtectedRoute>
            } />
            <Route path="/materias" element={
              <ProtectedRoute>
                <MateriasManagement />
              </ProtectedRoute>
            } />
            <Route path="/boletas" element={
              <ProtectedRoute>
                <BoletaManagement />
              </ProtectedRoute>
            } />
            <Route path="/configuracion" element={
              <ProtectedRoute>
                <ConfiguracionManagement />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
