import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Register() {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');

        if (motDePasse !== confirmMotDePasse) {
            setErreur('Les mots de passe ne correspondent pas.');
            return;
        }
        if (motDePasse.length < 6) {
            setErreur('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setChargement(true);

        try {
            const response = await api.post('/auth/register', {
                nom,
                prenom,
                email,
                telephone,
                mot_de_passe: motDePasse,
            });

            // Connexion automatique après inscription
            const loginResponse = await api.post('/auth/login', {
                email,
                mot_de_passe: motDePasse,
            });

            localStorage.setItem('token', loginResponse.data.token);
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
            navigate('/dashboard-patient');

        } catch (err) {
            setErreur(err.response?.data?.message || "Erreur lors de l'inscription");
        } finally {
            setChargement(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
            <h1>Allo Docteur</h1>
            <h2>Créer un compte patient</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                    <label>Nom</label>
                    <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label>Prénom</label>
                    <input
                        type="text"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label>Téléphone</label>
                    <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label>Confirmer le mot de passe</label>
                    <input
                        type="password"
                        value={confirmMotDePasse}
                        onChange={(e) => setConfirmMotDePasse(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

                <button type="submit" disabled={chargement} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
                    {chargement ? 'Création...' : "S'inscrire"}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
        </div>
    );
}

export default Register;