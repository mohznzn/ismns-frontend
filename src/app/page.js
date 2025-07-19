'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [niveau, setNiveau] = useState('débutant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
	


    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate_qcm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme, niveau }),
      });

      if (!res.ok) {
        throw new Error('Erreur backend');
      }

      const data = await res.json();
      const qcmId = data.qcm_id;

      router.push(`/test?qcm_id=${qcmId}`);
    } catch (error) {
      alert("Erreur de connexion au backend");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Générateur de QCM IA</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <label>
          Thème :
          <input
            type="text"
            name="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </label>
        <label>
          Niveau :
          <select
            name="niveau"
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
          </select>
        </label>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Générer le QCM'}
        </button>
      </form>
    </main>
  );
}
