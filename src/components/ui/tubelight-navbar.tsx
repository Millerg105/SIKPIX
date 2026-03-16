import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation();

  return (
    <div className={cn("hidden md:flex", className)}>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.url;

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "relative flex items-center justify-center rounded-full px-5 py-2.5 font-cta text-xs font-bold uppercase tracking-[0.18em] transition-colors duration-300",
                "text-white/72 hover:text-primary",
                isActive && "text-primary",
              )}
            >
              <span className="lg:hidden">
                <Icon size={18} strokeWidth={2.25} />
              </span>
              <span className="hidden lg:inline">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="sikpix-tubelight"
                  className="absolute inset-0 -z-10 rounded-full border border-primary/30 bg-primary/8"
                  initial={false}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                >
                  <div className="absolute left-1/2 top-0 h-[2px] w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary">
                    <div className="absolute -left-2 -top-1 h-4 w-14 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute left-1 top-0 h-3 w-8 rounded-full bg-primary/25 blur-sm" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
