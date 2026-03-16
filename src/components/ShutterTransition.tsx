import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ShutterTransition = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<"closed" | "opening" | "idle">("idle");

  useEffect(() => {
    // Skip on initial mount
    if (!isTransitioning) {
      setIsTransitioning(true);
      return;
    }

    // Trigger shutter close then open - slower, smoother animation
    setPhase("closed");
    
    const openTimer = setTimeout(() => {
      setPhase("opening");
    }, 600);

    const idleTimer = setTimeout(() => {
      setPhase("idle");
    }, 1300);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(idleTimer);
    };
  }, [location.pathname]);

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Top blade */}
      <div
        className={`absolute top-0 left-0 right-0 h-1/2 bg-background transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          phase === "closed" ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
      
      {/* Bottom blade */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1/2 bg-background transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          phase === "closed" ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
    </div>
  );
};

export default ShutterTransition;
