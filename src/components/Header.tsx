import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Camera, CircleDollarSign, GalleryVerticalEnd, SwatchBook, Shirt, Car } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/ui/tubelight-navbar";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/styles", label: "Styles" },
    { to: "/gallery", label: "Gallery" },
    { to: "/pricing", label: "Pricing" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/sick-threads", label: "Threads" },
    { to: "/sick-rides", label: "Rides" },
  ];

  const navItems = [
    { name: "Styles", url: "/styles", icon: SwatchBook },
    { name: "Gallery", url: "/gallery", icon: GalleryVerticalEnd },
    { name: "Pricing", url: "/pricing", icon: CircleDollarSign },
    { name: "How It Works", url: "/how-it-works", icon: Camera },
    { name: "Threads", url: "/sick-threads", icon: Shirt },
    { name: "Rides", url: "/sick-rides", icon: Car },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-6">
        <Link to="/" className="group flex items-center gap-3 transition-opacity duration-300 hover:opacity-80">
          <img
            src="/logo-sikpix.png"
            alt="SikPix"
            className="h-10 w-auto object-contain md:h-12"
          />
        </Link>

        {/* Desktop Navigation */}
        <NavBar items={navItems} className="flex-1 justify-center" />

        <div className="flex items-center gap-4">
          <Button variant="hero" size="sm" className="hidden md:inline-flex" asChild>
            <Link to="/create">Upload Your Car</Link>
          </Button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all hover:border-primary hover:text-primary active:border-primary active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 right-0 top-full border-b border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-4"
        }`}
      >
        <nav className="container mx-auto flex flex-col gap-4 px-6 py-8">
          {/* Mobile Logo */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mb-2 flex items-center gap-2 border-b border-border/50 pb-4"
          >
            <img
              src="/logo-sikpix.png"
              alt="SikPix"
              className="h-10 w-auto object-contain"
            />
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`font-body text-sm tracking-widest uppercase transition-colors py-2 ${
                isActive(link.to)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border/50">
            <Button variant="luxury" className="w-full" asChild>
              <Link to="/create" onClick={() => setIsMobileMenuOpen(false)}>
                Upload Your Car
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
