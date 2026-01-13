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
        <h2 className="text-2xl/tight font-semibold text-gray-900 md:text-4xl">{title}</h2>
      )}
      {subtitle && (
        <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">{subtitle}</p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function LandingClient() {
  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
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
          className="pointer-events-none absolute inset-x-0 top-[-200px] z-[-1] h-[520px] overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(45deg, #3b82f6, #8b5cf6, #6366f1, #3b82f6)",
                backgroundSize: "400% 400%",
                animation: "gradientShift 15s ease infinite",
              }}
            />
          </div>
          <div className="absolute left-1/2 top-0 aspect-[2/1] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500 via-fuchsia-500 to-indigo-500 opacity-20 blur-3xl" />
          <div className="absolute left-[10%] top-[40%] aspect-[1/1] w-[480px] rounded-full bg-gradient-to-tr from-sky-400 to-emerald-400 opacity-25 blur-2xl" style={{ animation: "float 20s ease-in-out infinite" }} />
          <div className="absolute right-[8%] top-[20%] aspect-[1/1] w-[360px] rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 opacity-20 blur-2xl" style={{ animation: "float 15s ease-in-out infinite reverse" }} />
        </div>

        {/* HERO SECTION */}
        <header className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-20 md:pt-16">
          <div className="inline-flex items-center gap-2">
            <Badge>Trusted by Recruiters</Badge>
            <span className="text-xs text-gray-600">
              Reduce screening time by 70% with AI-powered assessments
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Hire smarter, not harder.{" "}
            <span className="bg-gradient-to-tr from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI-powered candidate assessments
            </span>{" "}
            that actually work.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
            Transform your hiring process with intelligent skills assessments.
            <br />
            Generate role-specific questions in seconds, evaluate candidates objectively, and get actionable insights—all while saving hours of manual screening.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:scale-105"
            >
              Get started free
            </Link>
            <Link
              href="/admin/qcm/new"
              className="inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:scale-105"
            >
              Create assessment
            </Link>
            <span className="text-xs text-gray-500">No credit card required • Start with 5 free assessments</span>
          </div>

          {/* Hero mockup */}
          <div className="mt-10">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-xl">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900">Intelligent Question Generation</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Simply paste your job description. Our AI analyzes the role requirements, identifies key skills, and generates comprehensive, role-specific questions with detailed explanations—all in under 60 seconds.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> <strong>Multilingual support</strong> — Create assessments in English, French, Arabic, and more
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> <strong>Context-aware questions</strong> — Questions tailored to your specific role and requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> <strong>Adaptive difficulty</strong> — Questions calibrated to match the seniority level
                    </li>
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
          </div>
        </header>

        {/* STATS SECTION */}
        <Section>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "70%", label: "Time saved on screening" },
              { value: "5 min", label: "To create an assessment" },
              { value: "15+", label: "Languages supported" },
              { value: "24/7", label: "Candidate access" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600 md:text-4xl">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* FEATURES SECTION */}
        <Section
          id="features"
          eyebrow="Powerful Features"
          title="Everything you need to make better hiring decisions"
          subtitle="A complete assessment platform designed for modern recruiters who value efficiency and accuracy."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "AI Question Generation",
                "Generate comprehensive, role-specific questions in seconds. Our AI analyzes job descriptions to create questions that actually test relevant skills, not just generic knowledge.",
              ],
              [
                "Secure Candidate Links",
                "Share unique, time-limited assessment links with candidates. Track completion status, monitor progress, and ensure a professional candidate experience.",
              ],
              [
                "Multilingual Assessments",
                "Create assessments in 15+ languages including English, French, Arabic, Spanish, and more. Perfect for global teams and diverse candidate pools.",
              ],
              [
                "Anti-Cheat Protection",
                "Built-in safeguards including time tracking, question randomization, answer pattern analysis, and session monitoring to ensure assessment integrity.",
              ],
              [
                "Comprehensive AI Reports",
                "Get detailed candidate analysis with strengths, skill gaps, risk factors, and personalized recommendations. Make data-driven hiring decisions faster.",
              ],
              [
                "Enterprise-Grade Security",
                "GDPR compliant with end-to-end encryption. Your candidate data is protected with industry-standard security measures and privacy controls.",
              ],
            ].map(([t, d]) => (
              <div key={t} className="h-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600" />
                <h3 className="mt-4 text-base font-semibold text-gray-900">{t}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* HOW IT WORKS */}
        <Section
          id="how"
          eyebrow="Simple Process"
          title="From job description to hiring decision in 4 steps"
          subtitle="Our streamlined workflow gets you from posting a role to evaluating candidates faster than ever."
        >
          <ol className="grid gap-6 md:grid-cols-4">
            {[
              [
                "Create Assessment",
                "Paste your job description, select the language, and choose the difficulty level. Our AI generates a complete assessment in under 60 seconds.",
              ],
              [
                "Share Link",
                "Copy the unique assessment link and send it to candidates via email, ATS, or any channel. No accounts required for candidates—just click and start.",
              ],
              [
                "Candidates Complete",
                "Candidates take the assessment on any device—desktop, tablet, or mobile. Questions are randomized and timed to ensure fair evaluation.",
              ],
              [
                "Review & Decide",
                "Access comprehensive AI-generated reports with scores, skill breakdowns, and recommendations. Identify top candidates and move them to interview.",
              ],
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

        {/* SCREENSHOTS */}
        <Section
          id="screens"
          eyebrow="See It In Action"
          title="Real platform, real results"
          subtitle="Experience the power of AI-driven candidate assessment with our intuitive dashboard designed for recruiters."
        >
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                src: "/screen-create.png",
                alt: "Create assessment",
                label: "Assessment Creation",
                description: "Generate role-specific questions instantly from any job description",
              },
              {
                src: "/screen-report.png",
                alt: "AI report",
                label: "Detailed Analytics",
                description: "Comprehensive candidate reports with actionable insights",
              },
            ].map(({ src, alt, label, description }) => (
              <div key={alt}>
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="relative aspect-[16/9]">
                    <Image src={src} alt={alt} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-gray-900">{label}</div>
                    <div className="mt-1 text-xs text-gray-600">{description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* PRICING */}
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
                className={`h-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${
                  t.highlight ? "ring-2 ring-blue-600" : ""
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t.price}
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="text-blue-600">•</span> {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 block rounded-xl px-4 py-2 text-center text-sm font-medium transition-all duration-300 hover:scale-105 ${
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

        {/* TESTIMONIALS */}
        <Section id="testimonials" eyebrow="Trusted by Recruiters" title="What hiring teams are saying">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              [
                "Sofia Martinez",
                "Head of Talent Acquisition",
                "ISMNS has transformed our hiring process. We've reduced our time-to-hire by 40% and the quality of candidates has improved significantly. The AI-generated questions are incredibly relevant to our roles.",
              ],
              [
                "Adam Richardson",
                "Tech Recruiter",
                "The assessment reports give us exactly what we need to make informed decisions. No more guessing—just clear, actionable insights about each candidate's strengths and areas for growth.",
              ],
              [
                "Claire Dubois",
                "HR Manager",
                "What used to take us hours now takes minutes. The multilingual support is a game-changer for our international hiring, and candidates love how straightforward the process is.",
              ],
            ].map(([name, role, text]) => (
              <figure key={name} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    {name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <figcaption className="text-sm font-medium text-gray-900">{name}</figcaption>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
                <blockquote className="mt-3 text-sm text-gray-700 leading-relaxed">"{text}"</blockquote>
              </figure>
            ))}
          </div>
        </Section>

        {/* CTA FINAL */}
        <Section>
          <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold">Ready to revolutionize your hiring process?</h3>
            <p className="mt-3 text-white/90 text-base md:text-lg max-w-2xl">
              Join hundreds of recruiters who are saving time, improving candidate quality, and making better hiring decisions with ISMNS. Start your free trial today—no credit card required.
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
            <p className="mt-4 text-xs text-white/70">✓ 5 free assessments included • ✓ No credit card required • ✓ Setup in under 2 minutes</p>
          </div>
        </Section>
      </div>
    </>
  );
}
