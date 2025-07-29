'use client';
import { useState } from 'react';

export default function Home() {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [chapitres, setChapitres] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedChapitre, setSelectedChapitre] = useState(null);

  // Étape 1 : lister les chapitres pour un thème donné
  const handleListerChapitres = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);
    setSelectedChapitre(null);

    try {
      const res = await fetch(`https://ismns-backend.onrender.com/get_chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) throw new Error('Erreur backend');

      const data = await res.json();
      setChapitres(data.chapitres || []);
    } catch (error) {
      alert("Erreur de connexion au backend");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : générer 30 questions pour un chapitre
  const handleGenererQuestions = async (chapitre) => {
    setSelectedChapitre(chapitre);
    setLoading(true);
    setQuestions([]);

    try {
      const res = await fetch(`https://ismns-backend.onrender.com/generer_questions_chapitre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, chapitre }),
      });

      if (!res.ok) throw new Error('Erreur backend');

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      alert("Erreur lors de la génération des questions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Préparez votre certification</h1>

      {/* Formulaire Thème */}
      <form onSubmit={handleListerChapitres} className="flex flex-col gap-4 w-full max-w-md">
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
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Lister les chapitres'}
        </button>
      </form>

      {/* Liste des chapitres */}
      {chapitres.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Chapitres :</h2>
          <ul className="space-y-2">
            {chapitres.map((chapitre, idx) => (
              <li
                key={idx}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => handleGenererQuestions(chapitre)}
              >
                {chapitre}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions générées */}
      {questions.length > 0 && (
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            Questions pour : {selectedChapitre}
          </h2>
          <ul className="space-y-4">
            {questions.map((q, idx) => (
              <li key={idx} className="p-4 border rounded bg-gray-50">
                <p className="font-bold mb-2">{q.question}</p>
                <ul className="list-disc pl-5">
                  {q.options.map((option, i) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
