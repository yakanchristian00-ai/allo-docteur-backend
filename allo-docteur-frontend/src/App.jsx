import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardPatient from './pages/DashboardPatient';
import PrendreRdv from './pages/PrendreRdv';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-patient" element={<DashboardPatient />} />
        <Route path="/rendez-vous" element={<PrendreRdv />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;