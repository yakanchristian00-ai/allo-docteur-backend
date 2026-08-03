import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardPatient from './pages/DashboardPatient';
import PrendreRdv from './pages/PrendreRdv';
import Urgence from './pages/Urgence';
import MessagesListe from './pages/MessagesListe';
import MessageChat from './pages/MessageChat';
import MesRendezVous from './pages/MesRendezVous';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-patient" element={<DashboardPatient />} />
        <Route path="/rendez-vous" element={<PrendreRdv />} />
        <Route path="/mes-rendez-vous" element={<MesRendezVous />} />
        <Route path="/mes-rdv" element={<MesRendezVous />} />
        <Route path="/urgence" element={<Urgence />} />
        <Route path="/messages" element={<MessagesListe />} />
        <Route path="/messages/:contactId" element={<MessageChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;