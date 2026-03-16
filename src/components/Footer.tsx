import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-black/55 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-6">
            <Link to="/">
              <h3 className="font-display text-2xl font-bold tracking-wide text-gradient-neon uppercase">
                SIKPIX
              </h3>
            </Link>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              Custom car art powered by Big Mon. Your ride, reimagined as a one-of-one digital poster or printed canvas.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/bigmon270"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@bigmon270"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                aria-label="TikTok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/bigmon270"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@bigmon270"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-body text-xs font-medium tracking-[0.2em] uppercase text-foreground">
              Explore
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/styles" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Styles
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/create" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Upload Your Car
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-body text-xs font-medium tracking-[0.2em] uppercase text-foreground">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/how-it-works" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:hello@sikpix.co.uk" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/pricing" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-body text-xs font-medium tracking-[0.2em] uppercase text-foreground">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="font-body text-xs text-muted-foreground">
            © 2025 SikPix · Powered by Big Mon @BIGMON270
          </p>
          <p className="font-body text-xs text-muted-foreground">
            24-48 hour delivery · Secure checkout · Money-back guarantee
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
