import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/8 bg-black/20 px-6 py-10 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-[3px] sm:px-10 sm:py-12">
          <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
            Ready to Transform Your Ride?
          </p>
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl uppercase">
            Your Car Deserves This
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-body text-lg text-muted-foreground">
            Join the crew. Upload your car, pick a style, and get a custom artwork that turns every car meet into an exhibition.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="hero"
              className="w-full sm:w-auto sm:min-w-[240px] bg-[#39FF14] text-black font-bold tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(57,255,20,0.25)] hover:bg-[#6aff4d] hover:shadow-[0_0_65px_rgba(57,255,20,0.45)] hover:-translate-y-0.5"
              asChild
            >
              <Link to="/create">Get Your SikPix</Link>
            </Button>
            <Button variant="heroOutline" size="hero" className="w-full sm:w-auto sm:min-w-[240px]" asChild>
              <Link to="/styles">View All Styles</Link>
            </Button>
          </div>
          <p className="mt-6 font-body text-sm text-muted-foreground">
            24-48 hour delivery · Secure checkout · One free re-edit included
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
