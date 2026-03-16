import type { ReactNode } from "react";
import { Warp } from "@paper-design/shaders-react";

import { cn } from "@/lib/utils";

type WarpShaderHeroProps = {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  backgroundOnly?: boolean;
  colors?: string[];
};

const defaultColors = [
  "hsl(0 0% 7%)",
  "hsl(0 0% 16%)",
  "hsl(0 0% 25%)",
  "hsl(120 88% 52% / 0.82)",
];

export default function WarpShaderHero({
  children,
  className,
  contentClassName,
  backgroundOnly = false,
  colors = defaultColors,
}: WarpShaderHeroProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.46}
          softness={0.88}
          distortion={0.26}
          swirl={0.44}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.11}
          scale={1.24}
          rotation={0}
          speed={0.3}
          colors={colors}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(120_100%_56%_/_0.2),transparent_34%),radial-gradient(circle_at_80%_20%,hsl(120_100%_56%_/_0.14),transparent_28%),radial-gradient(circle_at_20%_75%,hsl(120_100%_56%_/_0.08),transparent_24%),linear-gradient(180deg,hsl(0_0%_1%_/_0.72),hsl(0_0%_4%_/_0.5)_35%,hsl(0_0%_5%_/_0.64))]" />

      {backgroundOnly ? (
        children ? <div className={cn("relative z-10", contentClassName)}>{children}</div> : null
      ) : (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className={cn("w-full max-w-4xl space-y-8 text-center", contentClassName)}>
            {children ?? (
              <>
                <h1 className="text-balance font-sans text-5xl font-light text-white md:text-7xl">
                  Elegant Shader Backgrounds
                </h1>

                <p className="mx-auto max-w-3xl font-sans text-xl font-light leading-relaxed text-white/90 md:text-2xl">
                  Beautiful, performant shader effects that enhance your content without overwhelming it. Perfect for
                  hero sections, landing pages, and modern web experiences.
                </p>

                <div className="flex items-center justify-center gap-4 pt-4 sm:flex-row">
                  <button className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20">
                    Get Started
                  </button>
                  <button className="rounded-full bg-white px-8 py-4 font-medium text-gray-800 transition-transform duration-300 hover:scale-105">
                    View Examples
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
