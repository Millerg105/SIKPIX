import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const ChristmasPromoSection = () => {
  return (
    <section className="relative bg-obsidian py-20 sm:py-28 overflow-hidden">
      {/* Subtle grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle gold radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43,35%,55%,0.08)_0%,_transparent_60%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Christmas Edition Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-primary/30 rounded-full bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-body text-xs tracking-[0.2em] uppercase text-primary">
              Christmas Edition
            </span>
          </div>
          
          {/* Headline */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
            Christmas Portraits,{" "}
            <span className="text-gradient-gold italic">Reimagined.</span>
          </h2>
          
          {/* Subheading */}
          <p className="font-body text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Luxury AI portraits — Vogue covers, cinematic characters, and fine-art styles — delivered in 24–48 hours.
          </p>
          
          {/* Pricing */}
          <div className="mb-8 space-y-2">
            <p className="font-display text-2xl sm:text-3xl text-foreground">
              From <span className="text-gradient-gold">£8</span> per portrait
            </p>
            <p className="font-body text-sm text-primary/80">
              Bundle & save — up to 25% off when ordering multiple styles.
            </p>
          </div>
          
          {/* Supporting text */}
          <p className="font-body text-muted-foreground mb-10">
            The perfect Christmas gift. Digital delivery or museum-quality prints available.
          </p>
          
          {/* CTA Button */}
          <Link to="/styles">
            <Button 
              size="hero" 
              className="btn-luxury px-10 py-6 text-sm tracking-[0.15em] glow-gold"
            >
              Create a Christmas Portrait
            </Button>
          </Link>
          
          {/* Secondary details */}
          <p className="mt-8 font-body text-xs text-muted-foreground/70 tracking-wide">
            Limited Christmas availability · 24–48h delivery · Personal use rights included
          </p>
          
          {/* Decorative line */}
          <div className="mt-16 section-divider max-w-xs mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default ChristmasPromoSection;
