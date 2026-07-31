import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardPatient from './pages/DashboardPatient';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-patient" element={<DashboardPatient />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;