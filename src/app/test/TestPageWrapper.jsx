"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// ✅ Ici, tu peux utiliser `ssr: false` car on est dans un composant client
const TestClient = dynamic(() => import("@/components/TestClient"), {
  ssr: false,
});

export default function TestPageWrapper() {
  return (
    <Suspense fallback={<p>Chargement du test...</p>}>
      <TestClient />
    </Suspense>
  );
}
