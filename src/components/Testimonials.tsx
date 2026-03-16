const testimonials = [
  {
    quote: "Got my Fiesta ST done in the Cartoon style — it's now framed in the garage. Absolutely buzzing with how it turned out.",
    author: "Liam K.",
    location: "Manchester, UK",
    rating: 5,
  },
  {
    quote: "Ordered the GTA Street for my mate's birthday. His face when he opened it was priceless. Already ordering one for my own car.",
    author: "Daz T.",
    location: "Bolton, UK",
    rating: 5,
  },
  {
    quote: "The Neon Night style is SICK. Looks like my car belongs in a film. Big Mon absolutely smashed it.",
    author: "Kev R.",
    location: "Warrington, UK",
    rating: 5,
  },
  {
    quote: "Got 3 done as a bundle — my GTI, the missus' Polo, and my dad's classic Capri. Whole family loves them. Proper quality.",
    author: "Jake S.",
    location: "Liverpool, UK",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-16 text-center">
          <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
            What The Crew Says
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl uppercase">
            Reviews
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-luxury flex h-full flex-col p-8"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-primary"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-6 font-body text-lg italic leading-relaxed text-foreground">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-auto pt-2">
                <p className="font-body text-sm font-medium text-foreground">
                  {testimonial.author}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
