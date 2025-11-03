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
  const [customSkills, setCustomSkills] = useState([]); // Skills ajoutés manuellement
  const [newSkillInput, setNewSkillInput] = useState("");
  
  // État pour la barre de progression
  const [generationProgress, setGenerationProgress] = useState(null); // {current, total, current_skill, status}
  
  const MAX_SKILLS = 20;
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
      setCustomSkills([]); // Reset les skills personnalisés
      setNewSkillInput(""); // Reset l'input
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

  // Étape 2: Générer les questions avec les skills confirmés (avec progression)
  const onGenerateQuestions = async () => {
    // selectedSkills contient déjà tous les skills sélectionnés (extraits + personnalisés)
    if (selectedSkills.length === 0) {
      setError("Veuillez sélectionner ou ajouter au moins un skill");
      return;
    }

    if (selectedSkills.length > MAX_SKILLS) {
      setError(`Maximum ${MAX_SKILLS} skills autorisés`);
      return;
    }

    setLoading(true);
    setError("");
    setGenerationProgress({ current: 0, total: selectedSkills.length, status: "starting" });

    try {
      // Démarrer la génération et récupérer le task_id
      const data = await admin.createDraftFromJD({
        job_description: jobDescription.trim(),
        language,
        confirmed_skills: selectedSkills,
      });

      const taskId = data?.task_id;
      if (!taskId) {
        throw new Error("Missing task_id in response");
      }

      // Écouter les événements de progression
      admin.listenToGenerationProgress(
        taskId,
        (progress) => {
          console.log("[DEBUG] Progress update received:", progress);
          setGenerationProgress(progress);
          
          // Si terminé avec succès, rediriger
          if (progress.status === "completed" && progress.result?.qcm_id) {
            console.log("[DEBUG] Generation completed, redirecting to:", progress.result.qcm_id);
            setLoading(false);
            // Petit délai pour que l'utilisateur voie "100%" avant la redirection
            setTimeout(() => {
              console.log("[DEBUG] Executing redirect...");
              router.replace(`/admin/qcm/${progress.result.qcm_id}/review`);
            }, 500);
          }
          
          // Si erreur, afficher le message (mais ne pas rediriger)
          if (progress.status === "error") {
            console.error("[DEBUG] Generation error:", progress.error);
            setError(progress.error || "Erreur lors de la génération");
            setLoading(false);
            // Ne pas rediriger vers login, juste afficher l'erreur
          }
        },
        (err) => {
          // Ne pas rediriger automatiquement vers login pour les erreurs SSE
          // Ce callback ne devrait être appelé que pour les vraies erreurs réseau
          console.error("Progress listening error:", err);
          // Ne pas afficher d'erreur générique si c'est juste une fermeture de connexion
          if (err && err.message && !err.message.includes("EventSource")) {
            setError("Erreur de connexion avec le serveur");
          }
          setLoading(false);
        }
      );
    } catch (err) {
      const apiMsg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        `Erreur API ${err?.status || ""}`.trim();

      console.error("create_draft_from_jd error:", err);
      setError(apiMsg);
      setLoading(false);
      setGenerationProgress(null);
    }
  };

  const selectAll = () => {
    setSelectedSkills([...extractedSkills]);
  };

  const deselectAll = () => {
    const minSkills = customSkills.length > 0 ? customSkills : [];
    setSelectedSkills([...minSkills]); // Garder au moins les skills personnalisés
  };

  const addCustomSkill = () => {
    const skill = newSkillInput.trim();
    if (!skill) return;
    
    // Vérifier si le skill n'existe pas déjà (insensible à la casse)
    const allSkills = [...extractedSkills, ...customSkills].map(s => s.toLowerCase());
    if (allSkills.includes(skill.toLowerCase())) {
      setError(`Le skill "${skill}" existe déjà`);
      return;
    }
    
    // Vérifier la limite (selectedSkills contient déjà tous les skills sélectionnés)
    if (selectedSkills.length >= MAX_SKILLS) {
      setError(`Maximum ${MAX_SKILLS} skills autorisés`);
      return;
    }
    
    setCustomSkills([...customSkills, skill]);
    setSelectedSkills([...selectedSkills, skill]); // Ajouter automatiquement aux sélectionnés
    setNewSkillInput("");
    setError("");
  };

  const removeCustomSkill = (skill) => {
    setCustomSkills(customSkills.filter(s => s !== skill));
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const toggleSkill = (skill) => {
    // Ne pas permettre de désélectionner si on atteint 0 (sauf s'il reste des skills personnalisés)
    const willHaveZero = selectedSkills.length === 1 && selectedSkills.includes(skill) && customSkills.length === 0;
    if (willHaveZero) {
      setError("Au moins un skill doit être sélectionné");
      return;
    }
    
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      // Vérifier la limite avant d'ajouter (selectedSkills contient déjà tous les skills sélectionnés)
      if (selectedSkills.length >= MAX_SKILLS) {
        setError(`Maximum ${MAX_SKILLS} skills autorisés`);
        return;
      }
      setSelectedSkills([...selectedSkills, skill]);
    }
    setError("");
  };
  
  // Calculer le total de skills sélectionnés (selectedSkills contient déjà tous les skills sélectionnés)
  const totalSelectedCount = selectedSkills.length;

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
              Confirm Skills ({totalSelectedCount}/{MAX_SKILLS} selected)
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
            question will be generated per selected skill. Maximum {MAX_SKILLS} skills.
          </p>

          {/* Section pour ajouter un skill personnalisé */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">Add Custom Skill</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => {
                  setNewSkillInput(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                placeholder="Enter a new skill..."
                maxLength={50}
                disabled={totalSelectedCount >= MAX_SKILLS}
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:bg-gray-100"
              />
              <button
                onClick={addCustomSkill}
                disabled={!newSkillInput.trim() || totalSelectedCount >= MAX_SKILLS}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Add
              </button>
            </div>
            {totalSelectedCount >= MAX_SKILLS && (
              <p className="text-xs text-amber-600 mt-1">
                Maximum {MAX_SKILLS} skills reached. Remove some skills to add new ones.
              </p>
            )}
          </div>

          {/* Skills personnalisés ajoutés */}
          {customSkills.length > 0 && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Custom Skills Added</label>
              <div className="flex flex-wrap gap-2">
                {customSkills.map((skill, idx) => (
                  <div
                    key={`custom-${idx}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span className="text-sm font-medium">{skill}</span>
                    <button
                      onClick={() => removeCustomSkill(skill)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Barre de progression */}
          {generationProgress && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {generationProgress.status === "completed"
                    ? "Generation completed!"
                    : generationProgress.status === "error"
                    ? "Generation failed"
                    : `Generating question ${generationProgress.current || 0} of ${generationProgress.total || 0}`}
                </span>
                <span className="text-gray-500">
                  {generationProgress.current || 0}/{generationProgress.total || 0}
                </span>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((generationProgress.current || 0) / (generationProgress.total || 1)) * 100))}%`,
                  }}
                />
              </div>
              
              {/* Skill actuel */}
              {generationProgress.current_skill && generationProgress.status === "generating" && (
                <p className="text-xs text-gray-500">
                  Current skill: <span className="font-medium">{generationProgress.current_skill}</span>
                </p>
              )}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              onClick={onGenerateQuestions}
              disabled={loading || totalSelectedCount === 0}
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {loading
                ? `Generating ${totalSelectedCount} questions…`
                : `Generate ${totalSelectedCount} Questions`}
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
