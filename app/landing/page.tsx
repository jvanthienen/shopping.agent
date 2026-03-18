import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Personal Stylist | AI-Powered Shopping for Busy Women",
  description:
    "Upload two photos, answer a few questions, and get a curated wardrobe from your favorite brands — scored for your coloring, body shape, and style. Free to start.",
  openGraph: {
    title: "Your Personal Stylist | AI-Powered Shopping for Busy Women",
    description:
      "Stop browsing. Start wearing what actually works for you. AI color analysis, outfit curation, and size-filtered shopping from brands you love.",
    type: "website",
  },
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    number: "01",
    title: "Share two photos",
    description:
      "Upload a selfie and a full-body photo. Our AI analyzes your skin undertone, contrast level, and coloring to determine your color season — the same 12-season system professional stylists charge $300+ to do.",
  },
  {
    number: "02",
    title: "Tell us your style",
    description:
      "A short quiz about your work environment, fit preferences, and lifestyle. We build your complete style profile: best colors, ideal silhouettes, signature fabrics, and outfit formulas tailored to your climate.",
  },
  {
    number: "03",
    title: "Shop what works",
    description:
      "We scan new arrivals from your favorite brands, score every piece against your profile, and show you only what fits. Complete outfits. Your sizes. Your colors. Ready to buy.",
  },
];

const FEATURES = [
  {
    label: "Color analysis",
    title: "Know your colors with certainty, not guesswork.",
    description:
      "Our AI performs a full 12-season color analysis from your photos — the same methodology that costs $300-500 with a stylist. You get your exact season, the shades that make your skin glow, and the colors that wash you out. Every recommendation starts here.",
    detail: "12-season colorimetry, undertone analysis, contrast mapping",
    icon: "palette",
  },
  {
    label: "Smart scoring",
    title: "500 new arrivals. 50 that actually work for you.",
    description:
      "Every week, we scan new inventory across all your brands. Each item is scored 0-100 on color match, silhouette, fabric, climate suitability, and style personality. You only see products scoring 60+. Great matches are flagged instantly.",
    detail: "5-dimension scoring across color, fit, fabric, weather, style",
    icon: "score",
  },
  {
    label: "Outfit curation",
    title: "Stop wondering what goes with what.",
    description:
      "We assemble complete outfits styled for your personality, palette, and weather. Each comes with a vibe, total price, and the ability to swap any piece. Save the whole look or cherry-pick favorites.",
    detail: "Full outfits with swap, save, and direct purchase",
    icon: "outfit",
  },
  {
    label: "Practical fit",
    title: "Your size. Your city. Your schedule.",
    description:
      "We filter out anything not in your size before you see it. Recommendations adapt to your local climate. And because everything updates automatically, your feed is always current without you lifting a finger.",
    detail: "Size-aware, climate-adaptive, always up-to-date",
    icon: "filter",
  },
];

const STATS = [
  { value: "12-season", label: "color analysis" },
  { value: "100+", label: "products scored" },
  { value: "10+ brands", label: "one curated feed" },
  { value: "5 min", label: "to set up" },
];

const FAQ = [
  {
    q: "How does the color analysis work?",
    a: "You upload a selfie and our AI analyzes your skin undertone, contrast level, hair color, and eye color to determine your color season using the professional 12-season system. We validate with a personalized quiz. The result tells you exactly which colors flatter you and which to avoid.",
  },
  {
    q: "Which brands do you shop from?",
    a: "We shop from Zara, H&M, Mango, COS, & Other Stories, Massimo Dutti, Uniqlo, Quince, Aritzia, Everlane, and more. We focus on brands with great style, consistent quality, and frequent new arrivals.",
  },
  {
    q: "How accurate is the AI scoring?",
    a: "Each product is scored across five dimensions: color match, silhouette fit for your body shape, fabric quality, climate suitability, and alignment with your style personality. Products must score 60+ to appear in your feed.",
  },
  {
    q: "What if I don't like the recommendations?",
    a: "You can skip any product and swap pieces within outfits. You are always in control of what you save and buy.",
  },
  {
    q: "Is my data secure?",
    a: "Your photos are analyzed once to build your profile and are never stored on our servers. Your style profile is saved securely so your recommendations stay personalized.",
  },
  {
    q: "How much does it cost?",
    a: "Creating your style profile and getting personalized recommendations is free.",
  },
  {
    q: "How long does setup take?",
    a: "About five minutes. Upload two photos, answer a short quiz, and your curated wardrobe is ready.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Icon components                                                            */
/* -------------------------------------------------------------------------- */

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ScoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function OutfitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="9" rx="1" />
      <rect x="3" y="15" width="18" height="6" rx="1" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const ICONS: Record<string, ({ className }: { className?: string }) => React.ReactNode> = {
  palette: PaletteIcon,
  score: ScoreIcon,
  outfit: OutfitIcon,
  filter: FilterIcon,
};

/* -------------------------------------------------------------------------- */
/*  FAQ Accordion (client component inlined)                                   */
/* -------------------------------------------------------------------------- */

function FAQSection() {
  return (
    <div className="divide-y divide-stone-200/80">
      {FAQ.map((item, i) => (
        <details key={i} className="group">
          <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
            <span className="text-[15px] font-medium text-stone-800 pr-8 leading-snug">
              {item.q}
            </span>
            <ChevronDown className="w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="pb-5 text-stone-500 text-[15px] leading-relaxed -mt-1 pr-12">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* ------------------------------------------------------------------ */}
      {/*  Nav                                                                */}
      {/* ------------------------------------------------------------------ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="font-serif text-xl tracking-tight text-stone-900">
            Your Stylist
          </Link>
          <Link
            href="/profile"
            className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.97]"
          >
            Create My Profile
          </Link>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/*  Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Overlay for luxury feel */}
        <div className="absolute inset-0 bg-stone-900/40" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-sm font-medium tracking-[0.25em] uppercase text-stone-300 mb-6">
            Effective shopping for effective women
          </p>
          <h1 className="font-serif text-4xl md:text-[3.5rem] md:leading-[1.12] text-white tracking-tight">
            Your personal stylist that shops while you work.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-stone-300 leading-relaxed max-w-2xl mx-auto font-light">
            Upload two photos. Answer a few questions. Get a curated wardrobe
            from your favorite brands — scored for your coloring, body
            shape, and style.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/profile"
              className="px-10 py-4 bg-white text-stone-900 rounded-full text-base font-medium hover:bg-stone-100 transition-all active:scale-[0.97]"
            >
              Create My Style Profile
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 text-stone-300 text-base font-medium hover:text-white transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Stats bar                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-stone-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-serif text-stone-900">
                {stat.value}
              </p>
              <p className="text-sm text-stone-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  How it works                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-4">
              How it works
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
              Five minutes now. Hours saved every season.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <span className="font-serif text-6xl text-stone-200 leading-none block mb-4">
                  {step.number}
                </span>
                <h3 className="text-xl font-semibold text-stone-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-stone-500 leading-relaxed text-[15px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/profile"
              className="inline-flex px-10 py-4 bg-stone-900 text-white rounded-full text-base font-medium hover:bg-stone-800 transition-all active:scale-[0.97] shadow-sm"
            >
              Start My Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Features                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-4">
              What you get
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
              Everything a personal stylist does.<br className="hidden md:block" /> None of the price tag.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <div
                  key={feature.icon}
                  className="bg-stone-50 rounded-2xl p-8 md:p-10 border border-stone-100 hover:border-stone-200 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-stone-600" />
                    </div>
                    <span className="text-xs font-medium tracking-widest uppercase text-stone-400 mt-2.5">
                      {feature.label}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-stone-900 leading-snug mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-stone-500 leading-relaxed text-[15px] mb-5">
                    {feature.description}
                  </p>
                  <p className="text-xs text-stone-400 tracking-wide">
                    {feature.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Brands                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-6 border-y border-stone-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-8">
            Curated from brands you know
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-16">
            {["Zara", "Uniqlo", "Quince", "H&M", "Mango", "COS", "& Other Stories", "Massimo Dutti", "Aritzia", "Everlane"].map((brand) => (
              <span
                key={brand}
                className="font-serif text-xl md:text-2xl text-stone-300 hover:text-stone-500 transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Social proof / Testimonials (placeholder)                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-4">
              What women are saying
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
              Less browsing. Better clothes.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "I used to spend my entire Sunday browsing online stores. Now I open this and everything is already picked for me. I bought three pieces last week and loved all of them.",
                name: "Early user",
                title: "Product Manager",
              },
              {
                quote:
                  "It told me I was a Soft Summer and suddenly my whole closet made sense. The colors it recommends genuinely look better on me than what I was picking on my own.",
                name: "Early user",
                title: "Startup Founder",
              },
              {
                quote:
                  "I would never have picked that blazer on my own but the score was 92 and it is now my favorite piece. This is like having a stylish friend who actually knows what she is talking about.",
                name: "Early user",
                title: "Attorney",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-stone-100 flex flex-col"
              >
                <p className="text-stone-600 text-[15px] leading-relaxed flex-1 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-stone-100">
                  <p className="text-sm font-medium text-stone-800">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-stone-300 mt-6">
            Testimonials from early beta users. Names withheld for privacy.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  FAQ                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-400 mb-4">
              Questions
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
              Frequently asked
            </h2>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Final CTA                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-5">
            Your wardrobe is waiting.
          </h2>
          <p className="text-lg text-stone-500 font-light leading-relaxed mb-10 max-w-lg mx-auto">
            Five minutes to a style profile. A lifetime of never
            second-guessing an outfit again.
          </p>
          <Link
            href="/profile"
            className="inline-flex px-10 py-4 bg-stone-900 text-white rounded-full text-base font-medium hover:bg-stone-800 transition-all active:scale-[0.97] shadow-sm"
          >
            Create My Style Profile
          </Link>
          <p className="text-sm text-stone-400 mt-5">
            Free. Takes 5 minutes. No credit card required.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-stone-200/80 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg text-stone-400">
            Your Stylist
          </span>
          <p className="text-sm text-stone-400">
            AI-powered personal styling. Shopping the brands you love.
          </p>
        </div>
      </footer>
    </main>
  );
}
