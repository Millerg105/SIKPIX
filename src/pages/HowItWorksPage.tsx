import { useEffect } from "react";
import { Link } from "react-router-dom";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Button } from "@/components/ui/button";
import step1Image from "@/assets/how-it-works/step-upload.jpg";
import step2Image from "@/assets/how-it-works/step-choose.jpg";
import step3Image from "@/assets/how-it-works/step-transform.jpg";
import step4Image from "@/assets/how-it-works/step-receive.png";

const steps = [
  {
    number: "01",
    title: "Upload Your Car",
    description: "Send us a photo of your car. Side profile or 3/4 angle works best. Any make, any model, any condition.",
    details: [
      "Any photo format accepted (JPG, PNG, HEIC)",
      "Good daylight and clean background recommended",
      "Show the full car, no cropped bumpers",
      "Can include extra vehicles (add-on available)",
    ],
    image: step1Image,
  },
  {
    number: "02",
    title: "Choose Your Style",
    description: "Select from 8 custom art styles including GTA Street, Neon Night, Drift, Cartoon and more. Pick a substyle to make it yours.",
    details: [
      "8 unique car art styles",
      "Multiple substyles per category",
      "Preview examples before choosing",
      "Mix and match for bundle discounts",
    ],
    image: step2Image,
  },
  {
    number: "03",
    title: "Big Mon Creates",
    description: "Your car gets transformed into a one-of-one custom artwork by Big Mon. Every detail, every mod captured.",
    details: [
      "Custom AI-assisted creation",
      "Human quality review by Big Mon",
      "Every mod and detail preserved",
      "Style-specific colour grading",
    ],
    image: step3Image,
  },
  {
    number: "04",
    title: "Receive Your Art",
    description: "Download your high-resolution artwork within 24-48 hours. Digital poster or printed canvas, your choice.",
    details: [
      "Secure digital delivery",
      "High-resolution PNG & JPG",
      "Print-ready files included",
      "Unlimited personal use license",
    ],
    image: step4Image,
  },
];

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Standard delivery is 24-48 hours. Rush delivery (12 hours guaranteed) is available as an add-on for +£9.99.",
  },
  {
    question: "What photo quality do I need?",
    answer: "A clear, well-lit photo showing the full car works best. Side profile or 3/4 angle in daylight is ideal. Higher resolution produces better results.",
  },
  {
    question: "Can I include multiple vehicles?",
    answer: "Yes! Each extra vehicle is +£5.00. Great for garage collections or car meet groups.",
  },
  {
    question: "Do I keep full rights to the image?",
    answer: "Absolutely. You receive unlimited personal use rights. Commercial licensing is available upon request.",
  },
  {
    question: "What if I'm not satisfied?",
    answer: "We offer one free revision within 7 days of delivery. If you're still not happy, we'll discuss a full refund.",
  },
  {
    question: "Can I get it printed?",
    answer: "Yes! We offer print-on-demand options including poster prints, framed prints, and premium canvas, delivered to your door.",
  },
];

const HowItWorksPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <PublicSiteShell>
      <div>
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-6">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
              The Process
            </p>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground md:text-6xl uppercase">
              How It Works
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
              From photo to custom car art in four simple steps. Upload your car, pick a style, and let Big Mon do the rest.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="pb-20">
          <div className="container mx-auto px-6">
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col gap-12 lg:flex-row lg:items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1">
                    <span className="font-display text-7xl font-bold text-primary/20">
                      {step.number}
                    </span>
                    <h2 className="mt-4 font-display text-3xl font-bold text-foreground uppercase">
                      {step.title}
                    </h2>
                    <p className="mt-4 font-body text-lg text-muted-foreground">
                      {step.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span className="font-body text-sm text-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <div className="card-luxury aspect-video overflow-hidden">
                      <img
                        src={step.image}
                        alt={step.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mb-12 text-center">
              <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
                Questions?
              </p>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl uppercase">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <div key={index} className="card-luxury p-8">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {faq.question}
                  </h3>
                  <p className="mt-3 font-body text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl uppercase">
              Ready to Get Your Car Done?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-muted-foreground">
              Upload your car and get a one-of-one custom artwork by Big Mon.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="hero" asChild>
                <Link to="/create">Upload Your Car</Link>
              </Button>
              <Button variant="heroOutline" size="hero" asChild>
                <Link to="/styles">View All Styles</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default HowItWorksPage;
