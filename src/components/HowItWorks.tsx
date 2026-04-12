const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Your Car",
      description: "Share a photo of your car. Side profile or 3/4 angle works best. Any car, any condition, any platform.",
    },
    {
      number: "02",
      title: "Choose Your Style",
      description: "Select from 8 custom art styles including GTA Street, Neon Night, Drift, Cartoon and more. Pick a substyle to make it yours.",
    },
    {
      number: "03",
      title: "Big Mon Creates",
      description: "Your car gets transformed into a custom one-of-one artwork by Big Mon. Every detail, every mod, every angle captured.",
    },
    {
      number: "04",
      title: "Preview Your Artwork",
      description: "We send you a watermarked preview so you can check every detail before we release the final file. Happy? We send the full resolution. Want changes? One free re-edit included.",
    },
    {
      number: "05",
      title: "Receive Your Art",
      description: "Download your high-resolution artwork within 24-48 hours. Digital poster or printed canvas, your choice.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-20 text-center">
          <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
            The Process
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl uppercase">
            How It Works
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative"
            >
              <div className="card-luxury h-full rounded-none p-10">
                <span className="font-display text-6xl font-bold text-primary/20 transition-colors group-hover:text-primary/40">
                  {step.number}
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-none tracking-[0.03em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-4 font-body text-base leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 translate-x-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
