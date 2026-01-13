"use client";

import { useEffect, useRef, useState } from "react";
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

// Composant 3D flottant pour le hero
function Floating3DCard({ delay = 0, children, className = "" }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x: (x / rect.width - 0.5) * 20, y: (y / rect.height - 0.5) * 20 });
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      return () => card.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-300 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${-mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg) translateZ(0)`,
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// Élément 3D avec effet de profondeur
function Card3D({ children, className = "", hover = true }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");

  useEffect(() => {
    if (!hover || !cardRef.current) return;

    const handleMouseMove = (e) => {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
    };

    const handleMouseLeave = () => {
      setTransform("perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)");
      setIsHovered(false);
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseleave", handleMouseLeave);
      card.addEventListener("mouseenter", () => setIsHovered(true));
      return () => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [hover]);

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-300 ease-out ${className}`}
      style={{ transform }}
    >
      {children}
    </div>
  );
}

// Particules animées en arrière-plan
function AnimatedParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-xl"
          style={{
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 200 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Gradient animé
function AnimatedGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(45deg, #3b82f6, #8b5cf6, #6366f1, #3b82f6)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      />
    </div>
  );
}

export default function LandingClient() {
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }

        @keyframes rotate-3d {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

      <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Animated Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[-200px] z-[-1] h-[520px] overflow-hidden"
        >
          <AnimatedGradient />
          <div className="absolute left-1/2 top-0 aspect-[2/1] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500 via-fuchsia-500 to-indigo-500 opacity-20 blur-3xl animate-pulse" />
          <div className="absolute left-[10%] top-[40%] aspect-[1/1] w-[480px] rounded-full bg-gradient-to-tr from-sky-400 to-emerald-400 opacity-25 blur-2xl" style={{ animation: "float 20s ease-in-out infinite" }} />
          <div className="absolute right-[8%] top-[20%] aspect-[1/1] w-[360px] rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 opacity-20 blur-2xl" style={{ animation: "float 15s ease-in-out infinite reverse" }} />
          <AnimatedParticles />
        </div>

        {/* HERO SECTION */}
        <header 
          ref={heroRef}
          className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-20 md:pt-16"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className="inline-flex items-center gap-2">
            <Badge>New</Badge>
            <span className="text-xs text-gray-600">
              AI-generated skills tests. Try it in minutes.
            </span>
          </div>

          <Floating3DCard delay={0.1}>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
              Assess candidates with{" "}
              <span className="bg-gradient-to-tr from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                AI-powered
              </span>{" "}
              tests.
            </h1>
          </Floating3DCard>

          <p className="mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
            Create an assessment, share a unique link, get a clear report. Multilingual QCM, anti-cheat basics, and instant insights.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="group relative inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transform-gpu transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
            >
              <span className="relative z-10">Get started free</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/admin/qcm/new"
              className="inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transform-gpu transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Create assessment
            </Link>
            <span className="text-xs text-gray-500">No credit card • 5 free assessments</span>
          </div>

          {/* Hero mockup avec effet 3D */}
          <div className="mt-10 perspective-1000">
            <Card3D hover={true}>
              <div className="overflow-hidden rounded-2xl border bg-white shadow-xl backdrop-blur-sm">
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-900">Smart generation</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Paste your job description, pick a language, and let the agent craft high-quality questions with explanations.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">•</span> Multilingual (EN/FR/AR…)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">•</span> Topic-aware questions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">•</span> Balanced difficulty
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
            </Card3D>
          </div>
        </header>

        {/* LOGOS SECTION */}
        <Section>
          <p className="text-center text-xs uppercase tracking-wider text-gray-500">
            Trusted by recruiters and teams
          </p>
          <div className="mt-5 grid grid-cols-2 items-center gap-6 opacity-70 md:grid-cols-6">
            {["vercel", "notion", "stripe", "figma", "github", "slack"].map((n, i) => (
              <div
                key={n}
                className="flex items-center justify-center transform-gpu transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-6 w-24 rounded bg-gray-200" aria-label={`${n} logo`} />
              </div>
            ))}
          </div>
        </Section>

        {/* FEATURES SECTION avec cartes 3D */}
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
              ["Secure & Private", "Candidate data handled with care and GDPR compliance."],
            ].map(([t, d], i) => (
              <Card3D key={t} hover={true} className="h-full">
                <div className="h-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 transform-gpu transition-transform duration-300 hover:rotate-12" />
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{t}</h3>
                  <p className="mt-2 text-sm text-gray-600">{d}</p>
                </div>
              </Card3D>
            ))}
          </div>
        </Section>

        {/* HOW IT WORKS avec étapes 3D */}
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
              <li key={t} className="perspective-1000">
                <Card3D hover={true}>
                  <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold transform-gpu transition-transform duration-300 hover:scale-110">
                      {i + 1}
                    </div>
                    <div className="text-xs font-semibold text-blue-600 mt-3">Step {i + 1}</div>
                    <div className="mt-2 text-base font-semibold">{t}</div>
                    <p className="mt-1 text-sm text-gray-600">{d}</p>
                  </div>
                </Card3D>
              </li>
            ))}
          </ol>
        </Section>

        {/* SCREENSHOTS avec effet parallaxe */}
        <Section
          id="screens"
          eyebrow="Product"
          title="Real UI, not mockups"
          subtitle="Use your live dashboard to create, share and review assessments."
        >
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { src: "/screen-create.png", alt: "Create assessment", label: "Create assessment" },
              { src: "/screen-report.png", alt: "AI report", label: "AI report" },
            ].map(({ src, alt, label }, i) => (
              <div
                key={alt}
                className="perspective-1000"
                style={{
                  transform: `translateY(${scrollY * (i === 0 ? 0.1 : -0.1)}px)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                <Card3D hover={true}>
                  <div className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-shadow duration-300">
                    <div className="relative aspect-[16/9]">
                      <Image src={src} alt={alt} fill className="object-cover" />
                    </div>
                    <div className="p-4 text-sm text-gray-600">{label}</div>
                  </div>
                </Card3D>
              </div>
            ))}
          </div>
        </Section>

        {/* PRICING avec cartes 3D */}
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
              <Card3D key={t.name} hover={true} className="h-full">
                <div
                  className={`h-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${
                    t.highlight ? "ring-2 ring-blue-600 scale-105" : ""
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
                    className={`mt-6 block rounded-xl px-4 py-2 text-center text-sm font-medium transform-gpu transition-all duration-300 hover:scale-105 ${
                      t.highlight
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t.cta}
                  </Link>
                </div>
              </Card3D>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">* fair-use limits to prevent abuse.</p>
        </Section>

        {/* TESTIMONIALS */}
        <Section id="testimonials" eyebrow="Loved by recruiters" title="What users say">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["Sofia M.", "Cuts our screening time in half."],
              ["Adam R.", "Questions feel surprisingly relevant."],
              ["Claire D.", "The report is exactly what we needed."],
            ].map(([name, text], i) => (
              <Card3D key={name} hover={true}>
                <figure className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 transform-gpu transition-transform duration-300 hover:scale-110" />
                    <figcaption className="text-sm font-medium text-gray-900">{name}</figcaption>
                  </div>
                  <blockquote className="mt-3 text-sm text-gray-700">"{text}"</blockquote>
                </figure>
              </Card3D>
            ))}
          </div>
        </Section>

        {/* CTA FINAL avec effet 3D */}
        <Section>
          <Card3D hover={true}>
            <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 text-white shadow-2xl transform-gpu transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-semibold">Ready to try ISMNS?</h3>
              <p className="mt-2 text-white/80">Spin up your first assessment in minutes.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-medium text-blue-700 hover:bg-white/90 transform-gpu transition-all duration-300 hover:scale-105"
                >
                  Get started
                </Link>
                <Link
                  href="/admin/qcm/new"
                  className="inline-flex h-11 items-center rounded-xl border border-white/30 px-5 text-sm font-medium text-white hover:bg-white/10 transform-gpu transition-all duration-300 hover:scale-105"
                >
                  Create assessment
                </Link>
              </div>
            </div>
          </Card3D>
        </Section>
      </div>
    </>
  );
}
