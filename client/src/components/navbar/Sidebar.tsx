import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import { LayoutDashboard, Brain, Activity, Settings, FlaskConical } from "lucide-react"

const sidebarItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/experiments", icon: FlaskConical, label: "Experiments" },
  { to: "/models", icon: Brain, label: "Models" },
  { to: "/cyber-games", icon: Activity, label: "Training" },
  { to: "/settings", icon: Settings, label: "Settings" },
]

export const Sidebar = () => {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-18 lg:w-20 bg-[#0c0c0c] border-r border-neutral-800 flex flex-col items-center py-6 gap-1 z-40">
      {sidebarItems.map((item) => {
        const isActive = location.pathname.startsWith(item.to)
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${
              isActive
                ? "bg-red-600/10 text-red-500"
                : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            }`}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="w-5 h-5" />
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-red-500 rounded-full" />
            )}
            {/* Tooltip on hover */}
            <span className="absolute left-16 px-2 py-1 rounded-md bg-neutral-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {item.label}
            </span>
          </Link>
        )
      })}
    </aside>
  )
}