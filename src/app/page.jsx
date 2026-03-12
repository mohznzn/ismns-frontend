"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
      {children}
    </span>
  );
}

function Section({ id, eyebrow, title, subtitle, children, className = "" }) {
  return (
    <section id={id} className={`relative mx-auto max-w-6xl px-4 py-16 md:py-24 ${className}`}>
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

const CHECK = (
  <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CANDIDATE_PACKS = [
  { qty: 50, price: 100, perCandidate: "2.00" },
  { qty: 100, price: 175, perCandidate: "1.75", popular: true },
  { qty: 200, price: 275, perCandidate: "1.38" },
];

function PricingCalculator() {
  const [assessments, setAssessments] = useState(1);
  const [packIdx, setPackIdx] = useState(0);
  const pack = CANDIDATE_PACKS[packIdx];
  const assessmentCost = assessments * 25;
  const candidateCost = assessments * pack.price;
  const total = assessmentCost + candidateCost;
  const totalCandidates = assessments * pack.qty;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 sm:px-8 sm:py-5">
        <h3 className="text-lg font-semibold text-white sm:text-xl">Pricing Calculator</h3>
        <p className="text-sm text-white/80 mt-1">Configure your plan and see the cost instantly</p>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Step 1 — Assessments */}
        <div>
          <label className="text-sm font-semibold text-gray-900">
            1. How many assessments do you need?
          </label>
          <p className="text-xs text-gray-500 mt-1">Each assessment = 1 job position with AI-generated questions</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setAssessments(Math.max(1, assessments - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
            >
              -
            </button>
            <div className="flex h-10 min-w-[4rem] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-lg font-semibold text-gray-900">
              {assessments}
            </div>
            <button
              onClick={() => setAssessments(Math.min(20, assessments + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
            >
              +
            </button>
            <span className="text-sm text-gray-500 ml-2">
              x <span className="font-semibold text-gray-900">€25</span> / assessment
            </span>
          </div>
        </div>

        {/* Step 2 — Candidate packs */}
        <div>
          <label className="text-sm font-semibold text-gray-900">
            2. How many candidates per assessment?
          </label>
          <p className="text-xs text-gray-500 mt-1">Each candidate gets a unique test link + AI report</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CANDIDATE_PACKS.map((p, i) => (
              <button
                key={p.qty}
                onClick={() => setPackIdx(i)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  packIdx === i
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                    Best value
                  </span>
                )}
                <div className="text-2xl font-bold text-gray-900">{p.qty}</div>
                <div className="text-xs text-gray-500 mt-0.5">candidates</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-blue-600">€{p.price}</span>
                  <span className="text-xs text-gray-500">/ assessment</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">€{p.perCandidate} per candidate</div>
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100" />

        {/* Summary */}
        <div className="rounded-xl bg-gray-50 p-5 sm:p-6">
          <div className="text-sm font-semibold text-gray-900 mb-4">Your estimate</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{assessments} assessment{assessments > 1 ? "s" : ""} x €25</span>
              <span className="font-medium text-gray-900">€{assessmentCost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{assessments} x {pack.qty} candidates (€{pack.price})</span>
              <span className="font-medium text-gray-900">€{candidateCost}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-baseline">
              <div>
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xs text-gray-500 ml-2">{totalCandidates} candidates across {assessments} assessment{assessments > 1 ? "s" : ""}</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                €{total}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              1st assessment + 5 candidates free — no credit card required
            </span>
          </div>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </div>
  );
}

function PricingCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Assessment unit */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">Assessment</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">€25</span>
          <span className="text-sm text-gray-500">/ test</span>
        </div>
        <p className="mt-3 text-sm text-gray-600">AI generates role-specific questions from your job description in seconds.</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> AI-generated QCM</li>
          <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Multilingual</li>
          <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Shareable link</li>
          <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Anti-cheat protection</li>
        </ul>
      </div>

      {/* Candidate packs */}
      {CANDIDATE_PACKS.map((p) => (
        <div
          key={p.qty}
          className={`rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${
            p.popular ? "ring-2 ring-blue-600 border-blue-600" : "border-gray-200"
          }`}
        >
          {p.popular && (
            <span className="inline-block rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide mb-3">
              Most popular
            </span>
          )}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          {!p.popular && <div className="h-3" />}
          <h3 className="mt-4 text-lg font-bold text-gray-900">{p.qty} Candidates</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">€{p.price}</span>
            <span className="text-sm text-gray-500">/ assessment</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">€{p.perCandidate} per candidate</p>
          <p className="mt-3 text-sm text-gray-600">Up to {p.qty} candidates can take the assessment and receive AI reports.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> {p.qty} test slots</li>
            <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Individual AI reports</li>
            <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> CV collection</li>
            <li className="flex items-center gap-2"><span className="text-blue-600">✓</span> Add more slots anytime</li>
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function LandingClient() {
  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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

        {/* ───────── HERO ───────── */}
        <header className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-20 md:pt-16">
          <div className="inline-flex items-center gap-2">
            <Badge>Trusted by Recruiters</Badge>
            <span className="text-xs text-gray-600 hidden sm:inline">
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

          <p className="mt-4 max-w-3xl text-base text-gray-600 md:text-lg">
            Transform your hiring process with intelligent skills assessments. Generate role-specific questions, evaluate candidates objectively, and get detailed AI reports — all in minutes.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:scale-105"
            >
              Get started free
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:scale-105"
            >
              See pricing
            </Link>
            <span className="text-xs text-gray-500">1st assessment + 5 candidates free — no credit card required</span>
          </div>

          {/* Hero mockup */}
          <div className="mt-12">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    AI-Powered
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">Intelligent Question Generation</h3>
                  <p className="mt-4 text-base text-gray-600 leading-relaxed">
                    Simply paste your job description. Our AI analyzes the role requirements, identifies key skills, and generates comprehensive, role-specific questions — all in under 60 seconds.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      ["Multilingual support", "Create assessments in English, French, Arabic, and more"],
                      ["Context-aware questions", "Questions tailored to your specific role and requirements"],
                      ["Detailed AI reports", "Each candidate gets a comprehensive analysis with scores and recommendations"],
                    ].map(([title, desc]) => (
                      <li key={title} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100">
                          {CHECK}
                        </div>
                        <div className="flex-1">
                          <strong className="text-gray-900">{title}</strong>
                          <span className="text-gray-600"> — {desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
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

        {/* ───────── STATS ───────── */}
        <Section>
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {[
              { value: "70%", label: "Time saved on screening" },
              { value: "< 60s", label: "To generate an assessment" },
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

        {/* ───────── HOW IT WORKS ───────── */}
        <Section
          id="how"
          eyebrow="Simple Process"
          title="From job description to hiring decision in 4 steps"
          subtitle="Our streamlined workflow gets you from posting a role to evaluating candidates faster than ever."
        >
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Create Assessment",
                "Paste your job description and select the language. Our AI generates a complete assessment in under 60 seconds.",
              ],
              [
                "Share Link",
                "Copy the unique assessment link and send it to candidates via email or any channel. No accounts needed for candidates.",
              ],
              [
                "Candidates Complete",
                "Candidates take the assessment on any device. Questions are randomized and timed to ensure fair evaluation.",
              ],
              [
                "Review & Decide",
                "Access comprehensive AI reports with scores, skill breakdowns, and recommendations. Identify top candidates instantly.",
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

        {/* ───────── FEATURES ───────── */}
        <Section
          id="features"
          eyebrow="Powerful Features"
          title="Everything you need to make better hiring decisions"
          subtitle="A complete assessment platform designed for modern recruiters who value efficiency and accuracy."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "AI Question Generation",
                "Generate comprehensive, role-specific questions in seconds. Our AI analyzes job descriptions to create questions that test relevant skills.",
                "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              ],
              [
                "Secure Candidate Links",
                "Share unique assessment links with candidates. Track completion status, monitor progress, and ensure a professional experience.",
                "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
              ],
              [
                "Multilingual Assessments",
                "Create assessments in 15+ languages including English, French, Arabic, Spanish, and more. Perfect for global teams.",
                "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
              ],
              [
                "Anti-Cheat Protection",
                "Built-in safeguards including time tracking, question randomization, and session monitoring to ensure assessment integrity.",
                "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              ],
              [
                "Comprehensive AI Reports",
                "Get detailed candidate analysis with strengths, skill gaps, risk factors, and personalized recommendations for every candidate.",
                "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              ],
              [
                "Pay As You Go",
                "No monthly subscriptions. Pay only for what you use — per assessment and per candidate pack. Add more slots anytime.",
                "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              ],
            ].map(([t, d, icon]) => (
              <div key={t} className="h-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{t}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ───────── SCREENSHOTS ───────── */}
        <Section
          id="screens"
          eyebrow="See It In Action"
          title="Real platform, real results"
          subtitle="Experience the power of AI-driven candidate assessment with our intuitive dashboard."
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
                label: "Detailed AI Reports",
                description: "Comprehensive candidate reports with actionable insights and scores",
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

        {/* ───────── PRICING ───────── */}
        <Section
          id="pricing"
          eyebrow="Transparent Pricing"
          title="Pay only for what you use"
          subtitle="No monthly subscriptions. No hidden fees. Choose the number of assessments and candidates you need — and only pay for that."
        >
          {/* Product cards */}
          <PricingCards />

          {/* How it works summary */}
          <div className="mt-8 rounded-xl bg-blue-50 border border-blue-100 p-5 sm:p-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">How it works</h4>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">1</div>
                <div>
                  <div className="font-medium text-gray-900">Create an assessment</div>
                  <div className="text-gray-600 text-xs mt-0.5">€25 per test — AI generates the questions</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">2</div>
                <div>
                  <div className="font-medium text-gray-900">Choose a candidate pack</div>
                  <div className="text-gray-600 text-xs mt-0.5">50, 100, or 200 candidates per assessment</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">3</div>
                <div>
                  <div className="font-medium text-gray-900">Need more? Add slots</div>
                  <div className="text-gray-600 text-xs mt-0.5">Extend anytime without losing data</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive calculator */}
          <div className="mt-10">
            <PricingCalculator />
          </div>

          {/* Comparison */}
          <div className="mt-10">
            <h4 className="text-base font-semibold text-gray-900 mb-4">How we compare</h4>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 text-left font-semibold text-gray-900">Feature</th>
                    <th className="py-3 px-4 text-center font-semibold text-blue-600">ISMNS</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-500">TestGorilla</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-500 hidden sm:table-cell">Codility</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {[
                    ["1 test + 50 candidates", "€125", "~€400/mo", "~€500/mo"],
                    ["AI-generated questions", "✓", "✗", "✗"],
                    ["Individual AI reports", "✓", "Partial", "✗"],
                    ["No subscription required", "✓", "✗", "✗"],
                    ["Multilingual", "15+ languages", "Limited", "English"],
                    ["Add candidates anytime", "✓", "✗", "✗"],
                  ].map(([feat, ismns, tg, cod]) => (
                    <tr key={feat} className="border-b border-gray-100">
                      <td className="py-2.5 pr-4 text-gray-900 font-medium">{feat}</td>
                      <td className="py-2.5 px-4 text-center text-blue-600 font-semibold">{ismns}</td>
                      <td className="py-2.5 px-4 text-center">{tg}</td>
                      <td className="py-2.5 px-4 text-center hidden sm:table-cell">{cod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ───────── TESTIMONIALS ───────── */}
        <Section id="testimonials" eyebrow="Trusted by Recruiters" title="What hiring teams are saying">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Sofia Martinez",
                "Head of Talent Acquisition",
                "ISMNS has transformed our hiring process. We've reduced our time-to-hire by 40% and the quality of candidates has improved significantly. The AI-generated questions are incredibly relevant.",
              ],
              [
                "Adam Richardson",
                "Tech Recruiter",
                "The assessment reports give us exactly what we need to make informed decisions. No more guessing — just clear, actionable insights about each candidate.",
              ],
              [
                "Claire Dubois",
                "HR Manager",
                "What used to take us hours now takes minutes. The multilingual support is a game-changer for our international hiring, and candidates love the process.",
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
                <blockquote className="mt-3 text-sm text-gray-700 leading-relaxed">&ldquo;{text}&rdquo;</blockquote>
              </figure>
            ))}
          </div>
        </Section>

        {/* ───────── FAQ ───────── */}
        <Section id="faq" eyebrow="FAQ" title="Frequently asked questions">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                "What's included in the free trial?",
                "Your first assessment is free, including AI-generated questions and up to 5 candidate evaluations with full AI reports. No credit card required.",
              ],
              [
                "Can I add more candidates after publishing?",
                "Yes! You can purchase additional candidate packs (50, 100, or 200) anytime and add them to an existing assessment without losing any data.",
              ],
              [
                "How is the AI report generated?",
                "Our AI analyzes each candidate's test performance, CV, and intake data to generate a comprehensive report with scores, strengths, weaknesses, and hiring recommendations.",
              ],
              [
                "Do candidates need to create an account?",
                "No. Candidates simply click the assessment link, enter their email, and start the test. It works on any device — desktop, tablet, or mobile.",
              ],
              [
                "What languages are supported?",
                "We support 15+ languages including English, French, Arabic, Spanish, German, Portuguese, and more. Questions are generated natively in the selected language.",
              ],
              [
                "Is there a monthly subscription?",
                "No. ISMNS uses a pay-as-you-go model. You pay per assessment (€25) and per candidate pack. No recurring fees, no commitments.",
              ],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow duration-200">
                <h4 className="text-sm font-semibold text-gray-900">{q}</h4>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ───────── CTA FINAL ───────── */}
        <Section>
          <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold">Ready to revolutionize your hiring?</h3>
            <p className="mt-3 text-white/90 text-base md:text-lg max-w-2xl">
              Join recruiters who are saving time, improving candidate quality, and making data-driven hiring decisions. Start your free trial today.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-semibold text-blue-700 hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Start free trial
              </Link>
              <Link
                href="#pricing"
                className="inline-flex h-12 items-center rounded-xl border-2 border-white/30 px-6 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                View pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/70">1st assessment free + 5 candidates included • No credit card required • Setup in under 2 minutes</p>
          </div>
        </Section>
      </div>
    </>
  );
}
