import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

// Simple route guard — redirects to /admin/login if no token
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public profile page — QR codes point here */}
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#d4d4d4', fontFamily: 'Montserrat, sans-serif' }}>
              <p>Page not found.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
