import { useState, useEffect } from "react";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<"dark" | "closing" | "opening" | "done">("dark");

  useEffect(() => {
    // Check if splash has been shown this session
    const hasSeenSplash = sessionStorage.getItem("sikpix_splash_shown");
    
    if (hasSeenSplash) {
      setIsVisible(false);
      setPhase("done");
      return;
    }

    // Mark as shown
    sessionStorage.setItem("sikpix_splash_shown", "true");

    // Animation timeline
    const darkTimer = setTimeout(() => setPhase("closing"), 200);
    const closingTimer = setTimeout(() => setPhase("opening"), 550);
    const openingTimer = setTimeout(() => setPhase("done"), 1100);
    const removeTimer = setTimeout(() => setIsVisible(false), 1400);

    return () => {
      clearTimeout(darkTimer);
      clearTimeout(closingTimer);
      clearTimeout(openingTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-300 ${
        phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Lens shutter blades */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Create 8 shutter blades */}
        {[...Array(8)].map((_, i) => {
          const rotation = i * 45;
          const isClosing = phase === "closing";
          const isOpening = phase === "opening" || phase === "done";
          
          return (
            <div
              key={i}
              className="absolute origin-center transition-transform"
              style={{
                width: "200vmax",
                height: "200vmax",
                background: "linear-gradient(180deg, hsl(0 0% 5%) 0%, hsl(0 0% 8%) 100%)",
                transform: `rotate(${rotation}deg) translateY(${
                  isOpening ? "-100%" : isClosing ? "0%" : "-100%"
                })`,
                transitionDuration: isClosing ? "350ms" : "500ms",
                transitionTimingFunction: isClosing 
                  ? "cubic-bezier(0.4, 0, 0.2, 1)" 
                  : "cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: "inset 0 0 30px hsl(43 35% 55% / 0.1)",
                borderBottom: "2px solid hsl(43 35% 55% / 0.3)",
              }}
            />
          );
        })}
        
        {/* Center aperture glow */}
        <div 
          className={`absolute w-32 h-32 rounded-full transition-all duration-500 ${
            phase === "closing" ? "scale-0 opacity-100" : 
            phase === "opening" ? "scale-150 opacity-0" : "scale-100 opacity-50"
          }`}
          style={{
            background: "radial-gradient(circle, hsl(43 35% 55% / 0.4) 0%, transparent 70%)",
            boxShadow: "0 0 60px hsl(43 35% 55% / 0.3)",
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;