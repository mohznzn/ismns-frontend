// ❌ Ne pas utiliser dynamic ici
// ✅ Utiliser un composant intermédiaire client

import TestPageWrapper from "./TestPageWrapper";

export default function Page() {
  return <TestPageWrapper />;
}
