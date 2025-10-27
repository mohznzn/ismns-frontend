export default function Section({
  id, title, subtitle, children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-2 text-sm opacity-80">{subtitle}</p>}
      </div>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

