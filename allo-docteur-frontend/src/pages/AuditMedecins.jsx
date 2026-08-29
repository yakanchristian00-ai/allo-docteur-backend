import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './TarifsAdmin.css';

const TYPE_LABELS = {
  licence: { label: 'Licence modifiée', couleur: '#2563EB', fond: '#DCE9FB' },
  demande_approuvee: { label: 'Demande approuvée', couleur: '#15803D', fond: '#DCFCE7' },
  demande_refusee: { label: 'Demande refusée', couleur: '#B91C1C', fond: '#FEE2E2' },
};

function AuditMedecins() {
  const navigate = useNavigate();
  const [historique, setHistorique] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get('/profil-medecin/audit/historique-complet')
      .then((res) => setHistorique(res.data))
      .catch(() => setHistorique([]))
      .finally(() => setChargement(false));
  }, []);

  const filtre = historique.filter((h) =>
    `${h.prenom} ${h.nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="admin-page">
      <AdminSidebar actif="utilisateurs" />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-search"><Search size={16} /> Rechercher...</div>
          <div className="admin-topbar-right">
            <button type="button">🔔</button>
            <button type="button">❓</button>
          </div>
        </div>

        <div className="admin-content">
          <div className="tarifs-header-row">
            <div>
              <h1>Audit — Modifications médecins</h1>
              <p>Historique complet de tous les changements apportés aux profils médecins.</p>
            </div>
          </div>

          <div className="tarifs-table-card">
            <div className="tarifs-table-header">
              <h2>Journal des modifications</h2>
              <input
                className="tarifs-search-input"
                placeholder="🔍 Rechercher un médecin..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>

            {chargement && <p className="tarifs-empty">Chargement...</p>}
            {!chargement && filtre.length === 0 && <p className="tarifs-empty">Aucune modification enregistrée.</p>}

            {!chargement && filtre.length > 0 && (
              <table className="tarifs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Médecin</th>
                    <th>Type</th>
                    <th>Avant → Après</th>
                    <th>Traité par</th>
                  </tr>
                </thead>
                <tbody>
                  {filtre.map((h) => {
                    const info = TYPE_LABELS[h.type] || { label: h.type, couleur: '#374151', fond: '#F1F3F6' };
                    return (
                      <tr key={`${h.type}-${h.id}`}>
                        <td>{new Date(h.date_action).toLocaleString('fr-FR')}</td>
                        <td
                          style={{ cursor: 'pointer', color: '#2563EB', fontWeight: 600 }}
                          onClick={() => navigate(`/historique-licence/${h.medecin_user_id}`)}
                        >
                          Dr. {h.prenom} {h.nom}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: info.fond, color: info.couleur }}>
                            {info.label}
                          </span>
                        </td>
                        <td className="description-cell">{h.ancienne_valeur || '—'} → <strong>{h.nouvelle_valeur}</strong></td>
                        <td>{h.modifie_par_prenom ? `${h.modifie_par_prenom} ${h.modifie_par_nom}` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuditMedecins;