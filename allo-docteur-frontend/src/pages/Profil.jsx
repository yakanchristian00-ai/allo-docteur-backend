import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Profil.css';

function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [telephone, setTelephone] = useState(user.telephone || '');
  const [adresse, setAdresse] = useState(user.adresse || '');
  const [editionActive, setEditionActive] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const inputPhotoRef = useRef(null);

  const [modalMotDePasse, setModalMotDePasse] = useState(false);
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [erreurMdp, setErreurMdp] = useState('');
  const [succesMdp, setSuccesMdp] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const enregistrer = async () => {
    try {
      await api.put('/profil/moi', { telephone, adresse });
      const userMisAJour = { ...user, telephone, adresse };
      localStorage.setItem('user', JSON.stringify(userMisAJour));
      setUser(userMisAJour);
      setEditionActive(false);
      setMessageSucces('Profil mis à jour !');
      setTimeout(() => setMessageSucces(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhoto = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setUploadEnCours(true);
    try {
      const formData = new FormData();
      formData.append('photo', fichier);

      const res = await api.post('/profil/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const userMisAJour = { ...user, photo_url: res.data.photo_url };
      localStorage.setItem('user', JSON.stringify(userMisAJour));
      setUser(userMisAJour);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadEnCours(false);
      e.target.value = '';
    }
  };

  const changerMotDePasse = async () => {
    setErreurMdp('');
    setSuccesMdp('');

    if (nouveauMdp !== confirmMdp) {
      setErreurMdp('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await api.put('/auth/changer-mot-de-passe', {
        ancien_mot_de_passe: ancienMdp,
        nouveau_mot_de_passe: nouveauMdp,
      });
      setSuccesMdp('Mot de passe modifié !');
      setAncienMdp('');
      setNouveauMdp('');
      setConfirmMdp('');
      setTimeout(() => { setModalMotDePasse(false); setSuccesMdp(''); }, 1500);
    } catch (err) {
      setErreurMdp(err.response?.data?.message || 'Erreur lors du changement');
    }
  };

  return (
    <div className="profil-page">
      <div className="profil-header">
        <div className="profil-header-left">
          {user.photo_url ? (
            <img
              src={`http://localhost:5000/api/fichiers${user.photo_url.replace('/uploads', '')}?token=${localStorage.getItem('token')}`}
              alt="Profil"
              className="profil-avatar-header"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="profil-avatar-header">🙂</div>
          )}
          <h1>Mon Profil</h1>
        </div>
        <button className="profil-logout" onClick={handleLogout} title="Déconnexion">⏻</button>
      </div>

      <div className="profil-identite">
        {user.photo_url ? (
          <img
            src={`http://localhost:5000/api/fichiers${user.photo_url.replace('/uploads', '')}?token=${localStorage.getItem('token')}`}
            alt="Profil"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px auto', display: 'block' }}
          />
        ) : (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 12px auto' }}>
            🙂
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={inputPhotoRef}
          style={{ display: 'none' }}
          onChange={handlePhoto}
        />
        <button
          onClick={() => inputPhotoRef.current.click()}
          disabled={uploadEnCours}
          style={{ background: '#EFF4FF', color: '#2563EB', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '10px' }}
        >
          {uploadEnCours ? 'Envoi...' : '📷 Changer ma photo'}
        </button>
        <h2>{user.prenom} {user.nom}</h2>
        <p>Patient ID: #{String(user.id).padStart(5, '0')}</p>
      </div>

      {messageSucces && (
        <p style={{ textAlign: 'center', color: '#15803D', fontSize: '13px', margin: '0 20px 12px 20px' }}>{messageSucces}</p>
      )}

      <div className="profil-section">
        <h2>Informations personnelles</h2>
        <div className="info-card">
          <div className="info-row">
            <div className="info-row-texte">
              <label>Email</label>
              <span>{user.email}</span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-row-texte" style={{ flex: 1 }}>
              <label>Téléphone</label>
              {editionActive ? (
                <input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  style={{ width: '100%', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', marginTop: '4px' }}
                />
              ) : (
                <span>{user.telephone || 'Non renseigné'}</span>
              )}
            </div>
            {!editionActive && (
              <button className="info-row-edit" onClick={() => setEditionActive(true)}>✎</button>
            )}
          </div>

          <div className="info-row">
            <div className="info-row-texte" style={{ flex: 1 }}>
              <label>Adresse</label>
              {editionActive ? (
                <input
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  style={{ width: '100%', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', marginTop: '4px' }}
                />
              ) : (
                <span>{user.adresse || 'Non renseignée'}</span>
              )}
            </div>
          </div>

          {editionActive && (
            <div style={{ padding: '14px 16px 0 16px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setEditionActive(false); setTelephone(user.telephone || ''); setAdresse(user.adresse || ''); }}
                style={{ flex: 1, background: '#F1F3F6', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={enregistrer}
                style={{ flex: 1, background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Enregistrer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profil-section">
        <h2>Sécurité & Documents</h2>
        <div className="action-card" onClick={() => setModalMotDePasse(true)} style={{ cursor: 'pointer' }}>
          <div className="action-icone">🔒</div>
          <div className="action-texte">Changer le mot de passe</div>
          <span className="action-chevron">›</span>
        </div>
        <div className="action-card">
          <div className="action-icone bleu">🪪</div>
          <div className="action-texte">Accéder à ma Carte Vitale</div>
          <span className="action-chevron">›</span>
        </div>
      </div>

      <div className="map-card">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop"
          alt="Carte du quartier"
        />
        <div className="map-pin">📍</div>
        <div className="map-overlay">
          <h3>Localiser mon centre</h3>
          <p>Douala, Cameroun</p>
        </div>
      </div>

      <div className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/dashboard-patient')}>🏠<span>Accueil</span></button>
        <button className="nav-item" onClick={() => navigate('/rendez-vous')}>📅<span>Rendez-vous</span></button>
        <button className="nav-item" onClick={() => navigate('/mes-rendez-vous')}>📅<span>Mes RDV</span></button>
        <button className="nav-item active">👤<span>Profil</span></button>
      </div>

      {modalMotDePasse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '380px', maxWidth: '100%' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Changer le mot de passe</h3>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Ancien mot de passe</label>
            <input
              type="password"
              value={ancienMdp}
              onChange={(e) => setAncienMdp(e.target.value)}
              style={{ width: '100%', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' }}
            />

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Nouveau mot de passe</label>
            <input
              type="password"
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              style={{ width: '100%', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' }}
            />

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmMdp}
              onChange={(e) => setConfirmMdp(e.target.value)}
              style={{ width: '100%', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />

            {erreurMdp && <p style={{ color: 'red', fontSize: '13px', marginTop: '10px' }}>{erreurMdp}</p>}
            {succesMdp && <p style={{ color: 'green', fontSize: '13px', marginTop: '10px' }}>{succesMdp}</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setModalMotDePasse(false)}
                style={{ flex: 1, background: '#F1F3F6', color: '#374151', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={changerMotDePasse}
                style={{ flex: 1, background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profil;