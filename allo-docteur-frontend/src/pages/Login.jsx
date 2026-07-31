import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login() {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');
        setChargement(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                mot_de_passe: motDePasse,
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            const role = response.data.user.role;
            if (role === 'patient') navigate('/dashboard-patient');
            else if (role === 'medecin') navigate('/dashboard-medecin');
            else if (role === 'admin') navigate('/dashboard-admin');

        } catch (err) {
            setErreur(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setChargement(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
            <h1>Allo Docteur</h1>
            <h2>Connexion</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

                <button type="submit" disabled={chargement} style={{ width: '100%', padding: '10px' }}>
                    {chargement ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
}

export default Login;