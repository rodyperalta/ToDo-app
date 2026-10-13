import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Tareas from './pages/Tareas';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tareas"
            element={
              <PrivateRoute>
                <Tareas />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/tareas" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;