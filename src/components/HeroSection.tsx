import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import NeonParticles from "./NeonParticles";

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  
  const recentPurchases = useMemo(() => 8 + Math.floor(Math.random() * 6), []);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const shimmerInterval = setInterval(() => {
      setShowShimmer(true);
      setTimeout(() => setShowShimmer(false), 2000);
    }, 15000);

    const initialShimmer = setTimeout(() => {
      setShowShimmer(true);
      setTimeout(() => setShowShimmer(false), 2000);
    }, 3000);

    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(shimmerInterval);
      clearTimeout(initialShimmer);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Background hero video */}
      <div 
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{ 
          transform: `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0002})`,
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline

          className="h-full w-full object-cover"
        >
          <source src="/hero-main.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability and brand alignment */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
      </div>

      {/* Shimmer overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          showShimmer ? "opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: 2 }}
      >
        <div className="absolute inset-0 animate-hero-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>
      
      {/* Neon Particles Layer */}
      <NeonParticles />
      
      {/* Dark Gradient Overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/12 to-transparent" style={{ zIndex: 6 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/20" style={{ zIndex: 6 }} />
      <div className="absolute inset-0 bg-background/5" style={{ zIndex: 5 }} />

      {/* Content */}
      <div className="container relative mx-auto flex min-h-screen flex-col justify-center px-6 pt-20" style={{ zIndex: 10 }}>
        <div className="max-w-2xl rounded-3xl border border-white/8 bg-black/20 px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-[3px] sm:px-8 sm:py-9">
          <div className={`space-y-5 transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              Custom Car Art · Powered by Big Mon
            </p>
            <h1 
              className="font-display text-[4.25rem] font-bold uppercase leading-[0.92] tracking-[0.01em] text-foreground md:text-7xl"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
            >
              Your Ride.{" "}
              <span className="text-gradient-neon">Reimagined.</span>
            </h1>
          </div>

          <div className={`mt-9 space-y-3 transition-all duration-1000 ease-out delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p 
              className="max-w-lg font-body text-[1.12rem] leading-[1.65] text-white/82"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
            >
              Upload a photo of your car. Choose your style. 
              Get a custom artwork, digital poster or printed canvas. Every piece is one-of-one.
            </p>
            <p className="font-body text-xs tracking-widest uppercase text-primary/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              By @BIGMON270 · North West Car Culture
            </p>
          </div>

          <div className={`mt-8 flex flex-col gap-4 transition-all duration-1000 ease-out delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="font-body text-sm font-medium tracking-[0.22em] uppercase text-white/90" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.45)" }}>
              Upload your car. Pick a style. We handle the rest.
            </p>
            <div className="flex max-w-md flex-col gap-3">
              <Button
                size="hero"
                className="w-full bg-[#39FF14] text-black font-semibold tracking-[0.2em] uppercase hover:bg-[#6aff4d] hover:shadow-[0_0_45px_rgba(57,255,20,0.35)]"
                asChild
              >
                <Link to="/create">Get Yours Now</Link>
              </Button>
              <Button variant="heroOutline" size="hero" className="w-full border-[#39FF14] text-[#39FF14]" asChild>
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </div>
            <p className="font-body text-xs text-white/60" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              One free re-edit included if you're not buzzing with your artwork.
            </p>
          </div>

          <div className={`flex flex-col gap-4 pb-24 pt-8 sm:pb-0`}>
            <div className={`flex items-center gap-4 sm:gap-8 transition-all duration-1000 ease-out delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="space-y-1">
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>8</p>
                <p className="font-body text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground">
                  Art Styles
                </p>
              </div>
              <div className="h-10 sm:h-12 w-px bg-border" />
              <div className="space-y-1">
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>24h</p>
                <p className="font-body text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground">
                  Delivery
                </p>
              </div>
              <div className="h-10 sm:h-12 w-px bg-border" />
              <div className="space-y-1">
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>4K+</p>
                <p className="font-body text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground">
                  Resolution
                </p>
              </div>
            </div>
            <p className={`font-body text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground transition-all duration-1000 ease-out delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="text-primary font-semibold">{recentPurchases}</span> cars transformed in the last 24h 🔥
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ease-out delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ zIndex: 10 }}>
        <div className="flex flex-col items-center gap-2">
          <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">
            Scroll
          </span>
          <div className="relative h-12 w-px overflow-hidden">
            <div className="absolute inset-0 animate-scroll-line bg-gradient-to-b from-primary via-primary to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
