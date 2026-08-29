import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileClock } from 'lucide-react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './TarifsAdmin.css';

function HistoriqueLicence() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [historique, setHistorique] = useState([]);
  const [medecin, setMedecin] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get('/users').then((res) => {
      const m = res.data.find((u) => String(u.id) === String(userId));
      if (m) setMedecin(m);
    }).catch(() => {});

    api.get(`/profil-medecin/${userId}/historique-licence`)
      .then((res) => setHistorique(res.data))
      .catch(() => setHistorique([]))
      .finally(() => setChargement(false));
  }, [userId]);

  return (
    <div className="admin-page">
      <AdminSidebar actif="utilisateurs" />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-search">🔍 Rechercher...</div>
          <div className="admin-topbar-right">
            <button type="button">🔔</button>
            <button type="button">❓</button>
          </div>
        </div>

        <div className="admin-content">
          <div className="tarifs-header-row">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <button
                type="button"
                onClick={() => navigate('/utilisateurs-admin')}
                style={{ background: '#F1F3F6', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1>Historique de la licence</h1>
                <p>{medecin ? `Dr. ${medecin.prenom} ${medecin.nom} — ${medecin.email}` : 'Chargement...'}</p>
              </div>
            </div>
          </div>

          <div className="tarifs-table-card">
            {chargement && <p className="tarifs-empty">Chargement...</p>}
            {!chargement && historique.length === 0 && (
              <p className="tarifs-empty">
                <FileClock size={32} style={{ display: 'block', margin: '0 auto 10px auto', opacity: 0.4 }} />
                Aucun changement de licence enregistré pour ce médecin.
              </p>
            )}

            {!chargement && historique.length > 0 && (
              <table className="tarifs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ancienne licence</th>
                    <th>Nouvelle licence</th>
                    <th>Modifié par</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((h) => (
                    <tr key={h.id}>
                      <td>{new Date(h.date_modification).toLocaleString('fr-FR')}</td>
                      <td className="description-cell">{h.ancienne_licence || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{h.nouvelle_licence}</td>
                      <td>{h.modifie_par_prenom} {h.modifie_par_nom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HistoriqueLicence;