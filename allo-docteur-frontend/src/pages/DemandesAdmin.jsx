import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './TarifsAdmin.css';

function DemandesAdmin() {
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    api.get('/profil-medecin/demandes').then((res) => setDemandes(res.data)).catch(() => setDemandes([])).finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const traiter = async (id, decision) => {
    try {
      await api.patch(`/profil-medecin/demandes/${id}`, { decision });
      charger();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar actif="utilisateurs" />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-search">🔍 Rechercher...</div>
          <div className="admin-topbar-right">
            <button>🔔</button>
            <button>❓</button>
          </div>
        </div>

        <div className="admin-content">
          <div className="tarifs-header-row">
            <div>
              <h1>Demandes de modification</h1>
              <p>Approuvez ou refusez les demandes envoyées par les médecins.</p>
            </div>
          </div>

          <div className="tarifs-table-card">
            {chargement && <p className="tarifs-empty">Chargement...</p>}
            {!chargement && demandes.length === 0 && <p className="tarifs-empty">Aucune demande en attente.</p>}

            {!chargement && demandes.length > 0 && (
              <table className="tarifs-table">
                <thead>
                  <tr>
                    <th>Médecin</th>
                    <th>Champ</th>
                    <th>Actuel</th>
                    <th>Demandé</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((d) => (
                    <tr key={d.id}>
                      <td>Dr. {d.prenom} {d.nom}</td>
                      <td style={{ textTransform: 'capitalize' }}>{d.champ.replace('_', ' ')}</td>
                      <td className="description-cell">{d.valeur_actuelle}</td>
                      <td style={{ fontWeight: 700 }}>{d.valeur_demandee}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => traiter(d.id, 'approuvee')} style={{ background: '#DCFCE7', color: '#15803D', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            Approuver
                          </button>
                          <button onClick={() => traiter(d.id, 'refusee')} style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            Refuser
                          </button>
                        </div>
                      </td>
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

export default DemandesAdmin;