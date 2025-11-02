// src/app/admin/qcm/new/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { admin } from "@/lib/api";

export default function NewQcmPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [extractingSkills, setExtractingSkills] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: extract skills, 2: confirm and generate
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const router = useRouter();

  // Étape 1: Extraire les skills
  const onExtractSkills = async (e) => {
    e.preventDefault();
    setExtractingSkills(true);
    setError("");

    try {
      const data = await admin.extractSkillsFromJD({
        job_description: jobDescription.trim(),
      });

      const skills = data?.skills || [];
      if (skills.length === 0) {
        throw new Error("Aucun skill détecté dans la description de poste");
      }

      setExtractedSkills(skills);
      setSelectedSkills([...skills]); // Sélectionner tous par défaut
      setStep(2);
    } catch (err) {
      const apiMsg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        `Erreur API ${err?.status || ""}`.trim();

      console.error("extract_skills_from_jd error:", err);
      setError(apiMsg);
    } finally {
      setExtractingSkills(false);
    }
  };

  // Étape 2: Générer les questions avec les skills confirmés
  const onGenerateQuestions = async () => {
    if (selectedSkills.length === 0) {
      setError("Veuillez sélectionner au moins un skill");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await admin.createDraftFromJD({
        job_description: jobDescription.trim(),
        language,
        confirmed_skills: selectedSkills,
      });

      const id = data?.qcm_id;
      if (!id) throw new Error("Missing qcm_id in response");
      router.replace(`/admin/qcm/${id}/review`);
    } catch (err) {
      const apiMsg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        `Erreur API ${err?.status || ""}`.trim();

      console.error("create_draft_from_jd error:", err);
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const selectAll = () => {
    setSelectedSkills([...extractedSkills]);
  };

  const deselectAll = () => {
    setSelectedSkills([]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create QCM from Job Description</h1>

      {step === 1 && (
        <form
          onSubmit={onExtractSkills}
          className="bg-white shadow rounded-2xl p-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the JD here..."
              rows={12}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={extractingSkills || !jobDescription.trim()}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {extractingSkills ? "Extracting skills…" : "Extract Skills"}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="bg-white shadow rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Confirm Skills ({selectedSkills.length} selected)
            </h2>
            <button
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              ← Back to JD
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Review and select the skills you want to include in the QCM. One
            question will be generated per selected skill.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAll}
              className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50"
            >
              Deselect All
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[400px] overflow-y-auto border rounded-xl p-4">
            {extractedSkills.map((skill, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black/10"
                />
                <span className="text-sm flex-1">{skill}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              onClick={onGenerateQuestions}
              disabled={loading || selectedSkills.length === 0}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {loading
                ? `Generating ${selectedSkills.length} questions…`
                : `Generate ${selectedSkills.length} Questions`}
            </button>
            <button
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
