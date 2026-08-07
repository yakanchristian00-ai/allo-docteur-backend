import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardPatient from './pages/DashboardPatient';
import PrendreRdv from './pages/PrendreRdv';
import Urgence from './pages/Urgence';
import MessagesListe from './pages/MessagesListe';
import MessageChat from './pages/MessageChat';
import Conseils from './pages/Conseils';
import MesRendezVous from './pages/MesRendezVous';
import Paiements from './pages/Paiements';
import Profil from './pages/Profil';
import DashboardMedecin from './pages/DashboardMedecin';
import UrgencesMedecin from './pages/UrgencesMedecin';
import RendezVousMedecin from './pages/RendezVousMedecin';
import PatientsMedecin from './pages/PatientsMedecin';
import ProfilMedecin from './pages/ProfilMedecin';
import DashboardAdmin from './pages/DashboardAdmin';
import UtilisateursAdmin from './pages/UtilisateursAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-patient" element={<DashboardPatient />} />
        <Route path="/rendez-vous" element={<PrendreRdv />} />
        <Route path="/urgence" element={<Urgence />} />
        <Route path="/messages" element={<MessagesListe />} />
        <Route path="/messages/:contactId" element={<MessageChat />} />
        <Route path="/conseils" element={<Conseils />} />
        <Route path="/mes-rendez-vous" element={<MesRendezVous />} />
        <Route path="/paiements" element={<Paiements />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/dashboard-medecin" element={<DashboardMedecin />} />
        <Route path="/urgences-medecin" element={<UrgencesMedecin />} />
        <Route path="/rendez-vous-medecin" element={<RendezVousMedecin />} />
        <Route path="/patients-medecin" element={<PatientsMedecin />} />
        <Route path="/profil-medecin" element={<ProfilMedecin />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/utilisateurs-admin" element={<UtilisateursAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;