import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Conseils.css';

const CATEGORIES = [
    { valeur: 'general', label: 'Général' },
    { valeur: 'perte_de_poids', label: 'Perte de poids' },
    { valeur: 'diabete', label: 'Diabète' },
];

const ICONES = ['🍊', '💧', '❤️', '🥬', '🥗', '🍎'];

function Conseils() {
    const navigate = useNavigate();
    const [categorieActive, setCategorieActive] = useState('general');
    const [conseils, setConseils] = useState([]);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        setChargement(true);
        api.get('/conseils')
            .then((res) => setConseils(res.data))
            .catch(() => setConseils([]))
            .finally(() => setChargement(false));
    }, []);

    const conseilsFiltres = conseils.filter((c) => c.categorie === categorieActive);

    return (
        <div className="conseils-page">
            <div className="conseils-header">
                <div className="conseils-header-left">
                    <button className="conseils-back" onClick={() => navigate('/dashboard-patient')}>←</button>
                    <h1>Conseils diététiques</h1>
                </div>
                <div className="conseils-header-right">
                    <button className="conseils-bell">🔔</button>
                    <div className="conseils-avatar">🙂</div>
                </div>
            </div>

            <div className="hero-banner">
                <h2>Bien-être & Santé</h2>
                <p>Découvrez nos guides personnalisés pour une alimentation équilibrée au quotidien.</p>
            </div>

            <div className="categories-scroll">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.valeur}
                        className={`categorie-chip ${categorieActive === c.valeur ? 'active' : ''}`}
                        onClick={() => setCategorieActive(c.valeur)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {chargement && <p className="conseils-empty">Chargement...</p>}

            {!chargement && conseilsFiltres.length === 0 && (
                <p className="conseils-empty">Aucun conseil dans cette catégorie pour le moment.</p>
            )}

            {conseilsFiltres.map((c, i) => (
                <div key={c.id} className="conseil-card">
                    <div className="conseil-icone">{ICONES[i % ICONES.length]}</div>
                    <div className="conseil-contenu">
                        <div className="conseil-top">
                            <h3>{c.titre}</h3>
                            <span className={`conseil-tag ${c.categorie}`}>
                                {CATEGORIES.find((cat) => cat.valeur === c.categorie)?.label || c.categorie}
                            </span>
                        </div>
                        <p className="conseil-preview">{c.contenu}</p>
                    </div>
                </div>
            ))}

           <div className="programme-banner">
             <h2>Programme Minceur</h2>
             <p>Accédez à votre menu personnalisé pour la semaine prochaine.</p>
             <button className="btn-programme" onClick={() => setCategorieActive('perte_de_poids')}>
                Consulter mon menu
             </button>
            </div>

            <div className="bottom-nav">
                <button className="nav-item active" onClick={() => navigate('/dashboard-patient')}>🏠<span>Accueil</span></button>
                <button className="nav-item" onClick={() => navigate('/rendez-vous')}>📅<span>Rendez-vous</span></button>
                <button className="nav-item" onClick={() => navigate('/messages')}>💬<span>Messages</span></button>
                <button className="nav-item" onClick={() => navigate('/profil')}>👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default Conseils;