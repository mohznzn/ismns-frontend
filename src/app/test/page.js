import { Suspense } from "react";
import TestClient from "../../components/TestClient";

export default function TestPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <TestClient />
    </Suspense>
  );
}