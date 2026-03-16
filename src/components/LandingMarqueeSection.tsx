import { MarqueeAnimation } from "@/components/ui/marquee-effect";

const primaryCopy = "DIGITAL ART FROM £9.99 • 3 STYLES £24.99 • 5 STYLES £34.99 • SIKPIX CUSTOM CAR ART • BIG MON";
const secondaryCopy = "MODIFIED BUILDS • GARAGE WALL PRINTS • DAILY DRIVERS • SHOW CARS • ONE-OF-ONE ARTWORK • SIKPIX";

export default function LandingMarqueeSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black/30 py-5 backdrop-blur-[2px] sm:py-6">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.1),rgba(0,0,0,0.35))]" />
      <div className="relative z-10 space-y-2">
        <MarqueeAnimation
          direction="left"
          baseVelocity={-0.28}
          className="border-y border-primary/20 bg-black/55 py-2 text-primary [text-shadow:0_0_18px_rgba(56,255,92,0.16)]"
        >
          {primaryCopy}
        </MarqueeAnimation>
        <MarqueeAnimation
          direction="right"
          baseVelocity={-0.31}
          className="bg-gradient-to-r from-primary/8 via-white/0 to-primary/8 py-1.5 text-white/70 sm:text-xl lg:text-[2rem]"
        >
          {secondaryCopy}
        </MarqueeAnimation>
      </div>
    </section>
  );
}
