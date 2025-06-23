import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const TestClient = dynamic(() => import('../../components/TestClient'), { ssr: false });

export default function TestPage() {
  return (
    <Suspense fallback={<p>Chargement…</p>}>
      <TestClient />
    </Suspense>
  );
}


