/**
 * Route-aware ambient layer: subtle gradient everywhere;
 * particle mesh only on marketing/auth pages.
 */
import { useLocation } from "react-router-dom";
import { ParticleBackground } from "@/components/ui/particle-background";

const MARKETING_PATHS = new Set([
  "/",
  "/about",
  "/contact",
  "/signin",
  "/signup",
]);

export function AmbientBackground() {
  const { pathname } = useLocation();
  const showParticles = MARKETING_PATHS.has(pathname);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cyber-radial opacity-90"
        aria-hidden
      />
      {showParticles && <ParticleBackground />}
    </>
  );
}
