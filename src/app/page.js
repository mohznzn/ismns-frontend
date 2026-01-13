// Server component wrapper for metadata
import LandingClient from "./LandingClient";

export const metadata = {
  title: "ISMNS – AI Recruiting Assessments",
  description:
    "Create skills assessments in minutes. Share a unique link, get clear AI reports, hire faster.",
};

export default function Landing() {
  return <LandingClient />;
}
