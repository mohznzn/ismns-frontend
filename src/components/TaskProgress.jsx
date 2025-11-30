"use client";

import { useEffect, useState } from "react";
import admin from "@/lib/api";

/**
 * Composant réutilisable pour afficher la progression d'une tâche Celery
 * 
 * @param {string} taskId - ID de la tâche Celery
 * @param {function} onComplete - Callback appelé quand la tâche est terminée avec succès
 * @param {function} onError - Callback appelé en cas d'erreur
 * @param {string} taskType - Type de tâche pour les messages personnalisés ("questions", "cv_analysis", "regenerate_question", "extract_skills")
 */
export default function TaskProgress({ taskId, onComplete, onError, taskType = "task" }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) return;

    const cleanup = admin.listenToTaskProgress(
      taskId,
      (progressData) => {
        setProgress(progressData);
        
        if (progressData.status === "completed") {
          if (onComplete) {
            onComplete(progressData.result || progressData);
          }
        } else if (progressData.status === "error") {
          const errorMsg = progressData.error || "Task failed";
          setError(errorMsg);
          if (onError) {
            onError(errorMsg);
          }
        }
      },
      (err) => {
        const errorMsg = err?.message || "Connection error";
        setError(errorMsg);
        if (onError) {
          onError(err);
        }
      }
    );

    return cleanup;
  }, [taskId, onComplete, onError]);

  if (!progress && !error) {
    return (
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Initializing...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t pt-4 space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      </div>
    );
  }

  const getStatusMessage = () => {
    if (progress.status === "completed") {
      return "Completed!";
    } else if (progress.status === "error") {
      return "Failed";
    } else if (progress.status === "pending") {
      return "Waiting to start...";
    } else if (progress.status === "retrying") {
      return "Retrying...";
    } else if (progress.status === "progress") {
      // Messages spécifiques selon le type de tâche
      if (taskType === "questions") {
        return `Generating question ${progress.current || 0} of ${progress.total || 0}`;
      } else if (taskType === "cv_analysis") {
        const step = progress.step || "processing";
        const stepMessages = {
          downloading_cv: "Downloading CV...",
          extracting_text: "Extracting text...",
          analyzing: "Analyzing CV...",
          generating_pdf: "Generating PDF...",
          processing: "Processing..."
        };
        return stepMessages[step] || progress.message || "Processing...";
      } else if (taskType === "regenerate_question") {
        return "Regenerating question...";
      } else if (taskType === "extract_skills") {
        return "Extracting skills...";
      }
      return progress.message || "Processing...";
    }
    return "Processing...";
  };

  const getProgressPercentage = () => {
    if (progress.status === "completed") return 100;
    if (progress.status === "error") return 0;
    if (progress.total && progress.total > 0) {
      return Math.min(100, Math.max(0, ((progress.current || 0) / progress.total) * 100));
    }
    if (progress.progress !== undefined) {
      return Math.min(100, Math.max(0, progress.progress));
    }
    return 0;
  };

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{getStatusMessage()}</span>
        {progress.total && progress.total > 0 && (
          <span className="text-gray-500">
            {progress.current || 0}/{progress.total}
          </span>
        )}
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${
            progress.status === "completed"
              ? "bg-green-500"
              : progress.status === "error"
              ? "bg-red-500"
              : "bg-black"
          }`}
          style={{
            width: `${getProgressPercentage()}%`,
          }}
        />
      </div>

      {/* Détails supplémentaires */}
      {progress.current_skill && progress.status === "progress" && (
        <p className="text-xs text-gray-500">
          Current skill: <span className="font-medium">{progress.current_skill}</span>
        </p>
      )}

      {progress.step && progress.status === "progress" && taskType === "cv_analysis" && (
        <p className="text-xs text-gray-500">
          Step: <span className="font-medium">{progress.step}</span>
        </p>
      )}
    </div>
  );
}

