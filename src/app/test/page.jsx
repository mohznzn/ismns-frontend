"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TestPage() {
  const searchParams = useSearchParams();
  const qcmId = searchParams.get("qcm_id");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (qcmId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_qcm/${qcmId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.questions) {
            setQuestions(data.questions);
          }
        });
    }
  }, [qcmId]);

  const handleAnswer = (choice) => {
    const question = questions[currentIndex];
    const correct = question.answer;
    setAnswers({ ...answers, [currentIndex]: choice });

    if (choice === correct) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowScore(true);
    }
  };

  if (!qcmId) return <p>❌ Aucun QCM ID fourni.</p>;
  if (!questions.length) return <p>📦 Chargement des questions...</p>;
  if (showScore) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">🎉 Test terminé</h2>
        <p>Votre score : {score} / {questions.length}</p>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Question {currentIndex + 1}</h2>
      <p className="mb-4">{current.question}</p>
      <div className="flex flex-col gap-2">
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(String.fromCharCode(65 + idx))}
            className="border rounded p-2 hover:bg-blue-100"
          >
            {String.fromCharCode(65 + idx)}) {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
