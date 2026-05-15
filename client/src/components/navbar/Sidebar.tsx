import { useLocation, Link } from "react-router-dom";
import { dashboardNavItems } from "@/const/data";

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-16 lg:w-20 bg-neutral-950/90 backdrop-blur-xl border-r border-neutral-800/50 flex flex-col items-center py-6 gap-1 z-40">
      {dashboardNavItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${
              isActive
                ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                : "text-neutral-500 hover:text-white hover:bg-neutral-800/60"
            }`}
            aria-label={item.name}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="w-5 h-5" />
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
            )}
            {/* Tooltip on hover */}
            <span className="absolute left-14 tooltip-cyber opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {item.name}
            </span>
          </Link>
        );
      })}
    </aside>
  );
};