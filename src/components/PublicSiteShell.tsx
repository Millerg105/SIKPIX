import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WarpShaderHero from "@/components/ui/wrap-shader";
import { cn } from "@/lib/utils";

type PublicSiteShellProps = {
  children: ReactNode;
  hero?: ReactNode;
  contentClassName?: string;
};

export default function PublicSiteShell({ children, hero, contentClassName }: PublicSiteShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-100 saturate-125">
        <WarpShaderHero backgroundOnly className="h-full min-h-full w-full" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,hsl(0_0%_1%_/_0.18),transparent_14%,transparent_82%,hsl(0_0%_1%_/_0.24))]" />

      <div className="relative z-20">
        <Header />
        <main>
          {hero}
          <div className={cn("relative z-10", hero ? "" : "pt-20", contentClassName)}>{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
