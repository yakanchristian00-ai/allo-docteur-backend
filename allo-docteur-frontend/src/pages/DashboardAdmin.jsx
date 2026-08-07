import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';

const MOIS_LABELS = { '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc' };

function initiales(nom, prenom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function DashboardAdmin() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/stats/overview')
            .then((res) => setStats(res.data))
            .catch(() => setStats(null));
    }, []);

    const dataGraphique = (stats?.rdvParMois || []).map((m) => ({
        mois: MOIS_LABELS[m.mois] || m.mois,
        total: Number(m.total),
    }));

    return (
        <div className="admin-page">
            <AdminSidebar actif="statistiques" />

            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="admin-search">🔍 Rechercher un dossier, un praticien...</div>
                    <div className="admin-topbar-right">
                        <button>🔔</button>
                        <button>❓</button>
                        <div className="admin-topbar-user">
                            <div className="admin-topbar-user-texte">
                                <p>{user.prenom} {user.nom}</p>
                                <span>Super Admin</span>
                            </div>
                            <div className="admin-topbar-user-avatar">🙂</div>
                        </div>
                    </div>
                </div>

                <div className="admin-content">
                    <div className="stats-grid-admin">
                        <div className="stat-card-admin">
                            <div className="stat-card-admin-top">
                                <div className="stat-card-admin-icone">📅</div>
                                <span className="stat-card-admin-badge">+12%</span>
                            </div>
                            <p className="stat-card-admin-label">Rendez-vous totaux</p>
                            <div className="stat-card-admin-value">{stats?.totalRdv ?? '—'}</div>
                        </div>

                        <div className="stat-card-admin">
                            <div className="stat-card-admin-top">
                                <div className="stat-card-admin-icone">🚨</div>
                                <span className="stat-card-admin-badge urgent">Urgent</span>
                            </div>
                            <p className="stat-card-admin-label">Urgences traitées</p>
                            <div className="stat-card-admin-value">{stats?.urgencesTraitees ?? '—'}</div>
                        </div>

                        <div className="stat-card-admin">
                            <div className="stat-card-admin-top">
                                <div className="stat-card-admin-icone">💰</div>
                                <span className="stat-card-admin-badge">Ce mois</span>
                            </div>
                            <p className="stat-card-admin-label">Revenus</p>
                            <div className="stat-card-admin-value">{Number(stats?.revenus ?? 0).toLocaleString('fr-FR')} FCFA</div>
                        </div>

                        <div className="stat-card-admin">
                            <div className="stat-card-admin-top">
                                <div className="stat-card-admin-icone">👤</div>
                                <span className="stat-card-admin-badge">+5.4%</span>
                            </div>
                            <p className="stat-card-admin-label">Utilisateurs actifs</p>
                            <div className="stat-card-admin-value">{stats?.utilisateursActifs ?? '—'}</div>
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-card-top">
                            <div>
                                <h2>Rendez-vous par mois</h2>
                                <p>Analyse de la fréquentation du premier semestre</p>
                            </div>
                            <div className="chart-actions">
                                <button className="btn-exporter">Exporter CSV</button>
                                <button className="btn-details">Détails</button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={dataGraphique}>
                                <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="table-card">
                        <div className="table-card-top">
                            <h2>Inscriptions récentes</h2>
                            <a onClick={() => navigate('/utilisateurs-admin')}>Voir tout</a>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Date</th>
                                    <th>Rôle</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stats?.inscriptionsRecentes || []).map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="table-user-cell">
                                                <div className="table-avatar">{initiales(u.nom, u.prenom)}</div>
                                                <div className="table-user-cell-texte">
                                                    <p>{u.prenom} {u.nom}</p>
                                                    <span>{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{new Date(u.date_creation).toLocaleDateString('fr-FR')}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                                        <td>
                                            <span className={`table-badge ${u.actif ? 'valide' : 'bloque'}`}>
                                                {u.actif ? 'Validé' : 'Bloqué'}
                                            </span>
                                        </td>
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

export default DashboardAdmin;