"use client";

import Image from "next/image";
import Link from "next/link";

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
        <h2 className="text-2xl/tight font-semibold text-gray-900 md:text-4xl">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">
          {subtitle}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function FAQItem({ q, a }) {
  return (
    <details className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm font-semibold text-gray-900">{q}</div>
          <div className="mt-0.5 shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700">
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </div>
        </div>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{a}</p>
    </details>
  );
}

export default function Page() {
  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Animated Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[-220px] z-[-1] h-[560px] overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(45deg, #3b82f6, #8b5cf6, #6366f1, #3b82f6)",
                backgroundSize: "400% 400%",
                animation: "gradientShift 15s ease infinite",
              }}
            />
          </div>
          <div className="absolute left-1/2 top-0 aspect-[2/1] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500 via-fuchsia-500 to-indigo-500 opacity-20 blur-3xl" />
          <div
            className="absolute left-[10%] top-[42%] aspect-[1/1] w-[480px] rounded-full bg-gradient-to-tr from-sky-400 to-emerald-400 opacity-25 blur-2xl"
            style={{ animation: "float 20s ease-in-out infinite" }}
          />
          <div
            className="absolute right-[8%] top-[18%] aspect-[1/1] w-[360px] rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 opacity-20 blur-2xl"
            style={{ animation: "float 15s ease-in-out infinite reverse" }}
          />
        </div>

        {/* TOP NAV */}
        <div className="relative mx-auto max-w-6xl px-4 pt-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-gray-900">
              ISMNS
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
              <Link href="#features" className="hover:text-gray-900">
                Features
              </Link>
              <Link href="#how" className="hover:text-gray-900">
                How it works
              </Link>
              <Link href="#pricing" className="hover:text-gray-900">
                Pricing
              </Link>
              <Link href="#faq" className="hover:text-gray-900">
                FAQ
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden text-sm font-medium text-gray-700 hover:text-gray-900 md:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:scale-105"
              >
                Start free
              </Link>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">No credit card required</div>
        </div>

        {/* HERO */}
        <header className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-20 md:pt-12">
          <div className="inline-flex items-center gap-2">
            <Badge>AI Hiring Assessments</Badge>
            <span className="text-xs text-gray-700">
              Built for modern recruiters • Create job-specific tests in minutes
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Hire smarter. Shortlist faster.{" "}
            <span className="bg-gradient-to-tr from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI-powered candidate assessments
            </span>{" "}
            that predict performance.
          </h1>

          <p className="mt-4 max-w-3xl text-base text-gray-600 md:text-lg">
            Create a role-specific assessment from a job description, send one secure
            link, and get clear scoring + insights—so you spend less time screening
            and more time hiring the right people.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:scale-105"
            >
              Start free trial
            </Link>
            <Link
              href="/admin/qcm/new"
              className="inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:scale-105"
            >
              Create my first assessment
            </Link>
            <span className="text-xs text-gray-500">
              No credit card • Setup in 2 minutes • Candidates don’t need an account
            </span>
          </div>

          <div className="mt-12">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="p-8 md:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI-Powered
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    Intelligent Question Generation
                  </h3>

                  <p className="mt-4 text-base text-gray-600 leading-relaxed">
                    Paste the job description. ISMNS generates a complete role-specific
                    assessment with questions, answer keys, and scoring—ready to send
                    in minutes.
                  </p>

                  <ul className="mt-6 space-y-3">
                    {[
                      ["Role-specific questions", "Questions tailored to your stack and responsibilities"],
                      ["Answer keys + explanations", "Faster review with consistent evaluation criteria"],
                      ["Adaptive difficulty", "Junior → senior calibrated automatically"],
                      ["Multilingual by design", "Create assessments in English, French, Arabic, and more"],
                    ].map(([strong, rest]) => (
                      <li key={strong} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <strong className="text-gray-900">{strong}</strong>
                          <span className="text-gray-600"> — {rest}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Link href="/register" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                      Start free trial →
                    </Link>
                  </div>
                </div>

                <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-50 via-white to-gray-50 border-l border-gray-200">
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
          </div>
        </header>

        {/* STATS */}
        <Section>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "Up to 70%", label: "Less time spent screening" },
              { value: "~5 min", label: "To create an assessment" },
              { value: "15+", label: "Languages supported" },
              { value: "24/7", label: "Candidate access worldwide" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600 md:text-4xl">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* FEATURES */}
        <Section
          id="features"
          eyebrow="POWERFUL FEATURES"
          title="Everything you need to make better hiring decisions"
          subtitle="From question generation to anti-cheat and reports—ISMNS covers the full assessment workflow in one simple platform."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["AI Question Generation", "Generate job-specific questions that match real responsibilities—not generic quizzes."],
              ["Secure Candidate Links", "Send one link per candidate, track completion, and keep every attempt organized."],
              ["Multilingual Assessments", "Assess candidates in their strongest language to reduce bias and widen your talent pool."],
              ["Anti-Cheat Protection", "Timers, randomization, and smart flags to protect assessment integrity."],
              ["Comprehensive AI Reports", "Clear scoring + insights (strengths, gaps, recommended follow-ups) to shortlist faster."],
              ["Enterprise-Grade Security", "Privacy-first by default with strong access control and data protection."],
            ].map(([t, d]) => (
              <div key={t} className="h-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600" />
                <h3 className="mt-4 text-base font-semibold text-gray-900">{t}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* HOW */}
        <Section
          id="how"
          eyebrow="SIMPLE WORKFLOW"
          title="From job description to shortlist in 4 steps"
          subtitle="Standardize evaluation, cut screening calls, and identify top performers quickly."
        >
          <ol className="grid gap-6 md:grid-cols-4">
            {[
              ["Create Assessment", "Paste the job description, choose seniority, and generate a complete test in minutes."],
              ["Share Link", "Send a secure link to candidates via email, ATS, or LinkedIn. No account needed."],
              ["Candidates Complete", "Candidates take the assessment on any device. Timed + structured for fair evaluation."],
              ["Review & Decide", "Compare results, see strengths and gaps, and move the best candidates to interview."],
            ].map(([t, d], i) => (
              <li key={t}>
                <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="text-xs font-semibold text-blue-600 mt-3">Step {i + 1}</div>
                  <div className="mt-2 text-base font-semibold text-gray-900">{t}</div>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* FAQ */}
        <Section id="faq" eyebrow="FAQ" title="Common questions" subtitle="Everything you need to know before you start.">
          <div className="grid gap-4 md:grid-cols-2">
            <FAQItem q="Do candidates need an account?" a="No. Candidates receive one secure link and can start immediately on any device." />
            <FAQItem q="Can I customize the generated questions?" a="Yes. You can edit, add, or remove questions before publishing the assessment." />
            <FAQItem q="How do you prevent cheating?" a="Use time limits, randomization, and smart flags that help detect suspicious patterns." />
            <FAQItem q="Is this GDPR-friendly?" a="ISMNS is privacy-first by design, with controls to handle candidate data responsibly." />
          </div>
        </Section>

        {/* FINAL CTA */}
        <Section>
          <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold">Ready to shortlist your next hire faster?</h3>
            <p className="mt-3 text-white/90 text-base md:text-lg max-w-2xl">
              Create your first AI-powered assessment in minutes. Send one link. Get clear scoring and insights. Hire with confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-semibold text-blue-700 hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/admin/qcm/new"
                className="inline-flex h-12 items-center rounded-xl border-2 border-white/30 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Create Your First Assessment
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/70">✓ No credit card required • ✓ Setup in 2 minutes • ✓ Candidates don’t need an account</p>
          </div>
        </Section>
      </div>
    </>
  );
}
