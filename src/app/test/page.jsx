import dynamic from 'next/dynamic';

const TestClient = dynamic(() => import('../../components/TestClient'), {
  ssr: false, // Empêche le rendu côté serveur
});

export default function TestPage() {
  return <TestClient />;
}