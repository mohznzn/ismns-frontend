import dynamic from "next/dynamic";
import { Suspense } from "react";

const TestClient = dynamic(() => import("../../components/TestClient"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement du test...</p>}>
      <TestClient />
    </Suspense>
  );
}
