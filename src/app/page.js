// src/app/page.jsx
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "ISMNS – AI Recruiting Assessments",
  description:
    "Create skills assessments in minutes. Share a unique link, get clear AI reports, hire faster.",
};

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
      {children}
    </span>
  );
}

function Section({ id, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
      {eyebrow && (
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-600">
          {eyebrow}
        </div>
      )}
      {title && (
        <h2 className="text-2xl/tight font-semibold text-gray-900 md:text-4xl">{title}</h2>
      )}
      {subtitle && (
        <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">{subtitle}</p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="relative">
      {/* ======= Radiant Gradient Background ======= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-200px] z-[-1] h-[520px] overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 aspect-[2/1] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500 via-fuchsia-500 to-indigo-500 opacity-20 blur-3xl" />
        <div className="absolute left-[10%] top-[40%] aspect-[1/1] w-[480px] rounded-full bg-gradient-to-tr from-sky-400 to-emerald-400 opacity-25 blur-2xl" />
        <div className="absolute right-[8%] top-[20%] aspect-[1/1] w-[360px] rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 opacity-20 blur-2xl" />
      </div>

      {/* ======= HERO ======= */}
      <header className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-20 md:pt-16">
        <div className="inline-flex items-center gap-2">
          <Badge>New</Badge>
          <span className="text-xs text-gray-600">
            AI-generated skills tests. Try it in minutes.
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          Assess candidates with{" "}
          <span className="bg-gradient-to-tr from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI-powered
          </span>{" "}
          tests.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
          Create an assessment, share a unique link, get a clear report. Multilingual QCM, anti-cheat basics, and instant insights.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Get started free
          </Link>
          <Link
            href="/admin/qcm/new"
            className="inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Create assessment
          </Link>
          <span className="text-xs text-gray-500">No credit card • 5 free assessments</span>
        </div>

        {/* Hero mockup (replace with real screenshot) */}
        <div className="mt-10 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900">Smart generation</h3>
              <p className="mt-2 text-sm text-gray-600">
                Paste your job description, pick a language, and let the agent craft high-quality questions with explanations.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li>• Multilingual (EN/FR/AR…)</li>
                <li>• Topic-aware questions</li>
                <li>• Balanced difficulty</li>
              </ul>
            </div>
            <div className="relative aspect-[16/10] bg-gradient-to-tr from-gray-50 to-white">
              <Image
                src="/hero-dashboard.png"
                alt="Assessment dashboard"
                fill
                className="object-cover object-left-top"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* ======= LOGOS ======= */}
      <Section>
        <p className="text-center text-xs uppercase tracking-wider text-gray-500">
          Trusted by recruiters and teams
        </p>
        <div className="mt-5 grid grid-cols-2 items-center gap-6 opacity-70 md:grid-cols-6">
          {["vercel", "notion", "stripe", "figma", "github", "slack"].map((n) => (
            <div key={n} className="flex items-center justify-center">
              <div className="h-6 w-24 rounded bg-gray-200" aria-label={`${n} logo`} />
            </div>
          ))}
        </div>
      </Section>

      {/* ======= FEATURES ======= */}
      <Section
        id="features"
        eyebrow="Features"
        title="Everything you need to screen faster"
        subtitle="Generate, share and review — all in one place."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["AI Question Generation", "Role-aware questions with explanations."],
            ["Unique Candidate Links", "Share a secure link and track responses."],
            ["Multilingual", "Create assessments in EN, FR, AR and more."],
            ["Anti-Cheat Basics", "Timing, randomization and answer tracking."],
            ["Clear AI Report", "Strengths, gaps, risks and recommendations."],
            ["Exports", "PDF/CSV exports for your ATS or HR workflows."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-50" />
              <h3 className="mt-4 text-base font-semibold text-gray-900">{t}</h3>
              <p className="mt-2 text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ======= HOW IT WORKS ======= */}
      <Section
        id="how"
        eyebrow="How it works"
        title="From prompt to decision in minutes"
      >
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            ["Create", "Paste the JD and set language/level."],
            ["Share", "Send a unique link to candidates."],
            ["Answer", "Candidates complete the test on any device."],
            ["Decide", "View the report and move to interview."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold text-blue-600">Step {i + 1}</div>
              <div className="mt-2 text-base font-semibold">{t}</div>
              <p className="mt-1 text-sm text-gray-600">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ======= SCREENSHOTS ======= */}
      <Section
        id="screens"
        eyebrow="Product"
        title="Real UI, not mockups"
        subtitle="Use your live dashboard to create, share and review assessments."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="relative aspect-[16/9]">
              <Image src="/screen-create.png" alt="Create assessment" fill className="object-cover" />
            </div>
            <div className="p-4 text-sm text-gray-600">Create assessment</div>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="relative aspect-[16/9]">
              <Image src="/screen-report.png" alt="AI report" fill className="object-cover" />
            </div>
            <div className="p-4 text-sm text-gray-600">AI report</div>
          </div>
        </div>
      </Section>

      {/* ======= PRICING ======= */}
      <Section id="pricing" eyebrow="Pricing" title="Simple pricing" subtitle="Start free. Upgrade as you grow.">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "€19/mo",
              points: ["1 recruiter", "100 assessments/mo", "PDF reports", "Email support"],
              cta: "Get started",
            },
            {
              name: "Team",
              price: "€49/mo",
              points: ["5 recruiters", "1,000 assessments/mo", "Priority support", "Branding"],
              cta: "Choose Team",
              highlight: true,
            },
            {
              name: "Scale",
              price: "Contact",
              points: ["SLA", "Unlimited*", "SSO & Audit logs", "Webhooks & API"],
              cta: "Contact sales",
            },
          ].map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border bg-white p-6 shadow-sm ${t.highlight ? "ring-2 ring-blue-600" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <div className="text-2xl">{t.price}</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {t.points.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-6 block rounded-xl px-4 py-2 text-center text-sm font-medium ${
                  t.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">* fair-use limits to prevent abuse.</p>
      </Section>

      {/* ======= TESTIMONIALS ======= */}
      <Section id="testimonials" eyebrow="Loved by recruiters" title="What users say">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Sofia M.", "Cuts our screening time in half."],
            ["Adam R.", "Questions feel surprisingly relevant."],
            ["Claire D.", "The report is exactly what we needed."],
          ].map(([name, text]) => (
            <figure key={name} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500" />
                <figcaption className="text-sm font-medium text-gray-900">{name}</figcaption>
              </div>
              <blockquote className="mt-3 text-sm text-gray-700">“{text}”</blockquote>
            </figure>
          ))}
        </div>
      </Section>

      {/* ======= CTA ======= */}
      <Section>
        <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
          <h3 className="text-2xl font-semibold">Ready to try ISMNS?</h3>
          <p className="mt-2 text-white/80">Spin up your first assessment in minutes.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-medium text-blue-700 hover:bg-white/90"
            >
              Get started
            </Link>
            <Link
              href="/admin/qcm/new"
              className="inline-flex h-11 items-center rounded-xl border border-white/30 px-5 text-sm font-medium text-white hover:bg-white/10"
            >
              Create assessment
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
