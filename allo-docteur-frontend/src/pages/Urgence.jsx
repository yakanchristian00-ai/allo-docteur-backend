import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useParametresPublic from '../hooks/useParametresPublic';
import './Urgence.css';

const NIVEAUX = [
  { valeur: 'moderee', label: 'Modérée', desc: "Besoin d'avis rapide", icone: '⚠️', classe: 'moderee' },
  { valeur: 'serieuse', label: 'Sérieuse', desc: 'Douleur intense / Inconfort', icone: '❗', classe: 'serieuse' },
  { valeur: 'critique', label: 'Critique', desc: 'Danger immédiat', icone: '❤️‍🩹', classe: 'critique' },
];

function Urgence() {
  const navigate = useNavigate();
  const { parametresPublic, chargementParametres } = useParametresPublic();
  const [symptomes, setSymptomes] = useState('');
  const [gravite, setGravite] = useState('serieuse');
  const [position, setPosition] = useState('Douala, Cameroun');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  if (!chargementParametres && parametresPublic.maintenance) {
    return (
      <div style={{ maxWidth: '420px', margin: '80px auto', textAlign: 'center', padding: '20px' }}>
        <h2>Service temporairement indisponible</h2>
        <p style={{ color: '#6B7280' }}>La déclaration d'urgences est suspendue pour maintenance. Merci de réessayer plus tard.</p>
        <button onClick={() => navigate('/dashboard-patient')} style={{ marginTop: '16px', padding: '10px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const handleEnvoyer = async () => {
    if (!symptomes.trim()) {
      setErreur('Merci de décrire vos symptômes.');
      return;
    }
    setErreur('');
    setSucces('');
    setChargement(true);

    try {
      await api.post('/urgences', { symptomes, gravite, position });
      setSucces('Votre demande a été envoyée. Une équipe médicale va vous contacter.');
      setTimeout(() => navigate('/dashboard-patient'), 2000);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'envoi de la demande");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="urgence-page">
      <div className="urgence-header">
        <div className="urgence-header-left">
          <button className="urgence-back" onClick={() => navigate('/dashboard-patient')}>←</button>
          <h1>Allo Docteur</h1>
        </div>
        <button className="urgence-info">ⓘ</button>
      </div>

      <div className="urgence-section">
        <h1 className="urgence-titre">Urgence médicale</h1>
        <p className="urgence-sous-titre">Restez calme, nous sommes là pour vous aider.</p>
      </div>

      <div className="urgence-section">
        <h2>Symptômes principaux</h2>
        <textarea
          className="urgence-textarea"
          placeholder="Décrivez brièvement ce que vous ressentez..."
          value={symptomes}
          onChange={(e) => setSymptomes(e.target.value)}
        />
      </div>

      <div className="urgence-section">
        <h2>Niveau de gravité</h2>
        {NIVEAUX.map((n) => (
          <div
            key={n.valeur}
            className={`gravite-option ${n.classe} ${gravite === n.valeur ? 'active' : ''}`}
            onClick={() => setGravite(n.valeur)}
          >
            <div className={`gravite-icone ${n.classe}`}>{n.icone}</div>
            <div className="gravite-texte">
              <h3>{n.label}</h3>
              <p>{n.desc}</p>
            </div>
            <div className={`gravite-radio ${gravite === n.valeur ? 'checked' : ''}`}></div>
          </div>
        ))}
      </div>

      <div className="urgence-section">
        <h2>Votre position</h2>
        <div className="position-input">
          📍
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
        <img
          className="map-preview"
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop"
          alt="Carte de localisation"
        />
      </div>

      {erreur && <p style={{ color: 'red', textAlign: 'center', fontSize: '13px' }}>{erreur}</p>}
      {succes && <p style={{ color: 'green', textAlign: 'center', fontSize: '13px' }}>{succes}</p>}

      <button className="btn-envoyer" onClick={handleEnvoyer} disabled={chargement}>
        ▷ {chargement ? 'Envoi en cours...' : 'Envoyer la demande'}
      </button>
      <p className="urgence-note">En cliquant, vous serez mis en relation avec une équipe médicale prioritaire.</p>

      <div className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/dashboard-patient')}>🏠<span>Accueil</span></button>
        <button className="nav-item active">🚨<span>Urgences</span></button>
        <button className="nav-item">🕐<span>Historique</span></button>
        <button className="nav-item" onClick={() => navigate('/profil')}>👤<span>Profil</span></button>
      </div>
    </div>
  );
}

export default Urgence;