import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import api from '../api/axios';
import './Disponibilites.css';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function Disponibilites() {
  const navigate = useNavigate();
  const [dispos, setDispos] = useState([]);
  const [jour, setJour] = useState('Lundi');
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('17:00');
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    api.get('/disponibilites/mes-disponibilites')
      .then((res) => setDispos(res.data))
      .catch(() => setDispos([]))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const ajouter = async () => {
    try {
      await api.post('/disponibilites', { jour_semaine: jour, heure_debut: heureDebut, heure_fin: heureFin });
      charger();
    } catch (err) {
      console.error(err);
    }
  };

  const supprimer = async (id) => {
    try {
      await api.delete(`/disponibilites/${id}`);
      charger();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dispo-page">
      <div className="dispo-header">
        <button className="dispo-back" onClick={() => navigate('/profil-medecin')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>Mes disponibilités</h1>
          <p>Définissez vos créneaux de consultation par jour.</p>
        </div>
      </div>

      <div className="dispo-form">
        <div className="dispo-form-row">
          <div>
            <label>Jour</label>
            <select value={jour} onChange={(e) => setJour(e.target.value)}>
              {JOURS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label>Début</label>
            <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} />
          </div>
          <div>
            <label>Fin</label>
            <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} />
          </div>
          <button className="btn-ajouter-dispo" onClick={ajouter}>Ajouter</button>
        </div>
      </div>

      {chargement && <p className="dispo-empty">Chargement...</p>}
      {!chargement && dispos.length === 0 && <p className="dispo-empty">Aucun créneau défini pour le moment.</p>}

      {JOURS.map((j) => {
        const creneauxDuJour = dispos.filter((d) => d.jour_semaine === j);
        if (creneauxDuJour.length === 0) return null;

        return (
          <div key={j} className="jour-groupe">
            <h3 className="jour-titre">{j}</h3>
            {creneauxDuJour.map((c) => (
              <div key={c.id} className="creneau-item">
                <span className="creneau-heures">{c.heure_debut.slice(0, 5)} — {c.heure_fin.slice(0, 5)}</span>
                <button className="btn-supprimer-creneau" onClick={() => supprimer(c.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default Disponibilites;