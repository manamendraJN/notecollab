import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e1e28',
                color: '#f0f0f5',
                border: '1px solid #2a2a38',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#34d399', secondary: '#1e1e28' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#1e1e28' } },
            }}
          />

          <Routes>
            {/* Public */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

          </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
