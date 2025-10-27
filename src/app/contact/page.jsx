import Section from "@/components/section";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact – ISMNS" };

export default function ContactPage() {
  return (
    <Section title="Contact sales" subtitle="Parlons de vos besoins.">
      <ContactForm />
    </Section>
  );
}
