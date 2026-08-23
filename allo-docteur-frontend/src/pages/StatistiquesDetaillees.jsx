import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './TarifsAdmin.css';
import { Calendar, BarChart3, Search, Bell, HelpCircle } from 'lucide-react';

const MOIS_LABELS = { '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril', '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août', '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre' };

function StatistiquesDetaillees() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats/overview').then((res) => setStats(res.data)).catch(() => setStats(null));
  }, []);

  const total = (stats?.rdvParMois || []).reduce((sum, m) => sum + Number(m.total), 0);
  const moyenne = stats?.rdvParMois?.length ? Math.round(total / stats.rdvParMois.length) : 0;

  return (
    <div className="admin-page">
      <AdminSidebar actif="statistiques" />
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-search"><Search size={16} /> Rechercher...</div>
          <div className="admin-topbar-right">
            <button><Bell size={18} /></button>
            <button><HelpCircle size={18} /></button>
          </div>
        </div>

        <div className="admin-content">
          <div className="tarifs-header-row">
            <div>
              <h1>Statistiques détaillées</h1>
              <p>Analyse complète des rendez-vous mois par mois.</p>
            </div>
          </div>

          <div className="tarifs-stats-row">
            <div className="tarifs-stat-card">
              <div className="tarifs-stat-icone"><Calendar size={20}/></div>
              <div className="tarifs-stat-texte">
                <p>Total rendez-vous (période)</p>
                <div className="tarifs-stat-value">{total}</div>
              </div>
            </div>
            <div className="tarifs-stat-card">
              <div className="tarifs-stat-icone"><BarChart3 size={20} /></div>
              <div className="tarifs-stat-texte">
                <p>Moyenne par mois</p>
                <div className="tarifs-stat-value">{moyenne}</div>
              </div>
            </div>
          </div>

          <div className="tarifs-table-card">
            <div className="tarifs-table-header">
              <h2>Détail par mois</h2>
            </div>
            <table className="tarifs-table">
              <thead>
                <tr>
                  <th>Mois</th>
                  <th className="numeric">Rendez-vous</th>
                  <th className="numeric">% du total</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.rdvParMois || []).map((m) => (
                  <tr key={m.mois}>
                    <td>{MOIS_LABELS[m.mois] || m.mois}</td>
                    <td className="numeric">{m.total}</td>
                    <td className="numeric">{total > 0 ? Math.round((m.total / total) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StatistiquesDetaillees;