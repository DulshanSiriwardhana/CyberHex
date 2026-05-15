import {
  LayoutDashboard,
  Brain,
  FlaskConical,
  Gamepad2,
  Settings,
  Info,
  Mail,
} from "lucide-react";

export const items = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  protected?: boolean;
}

export const dashboardNavItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, protected: true },
  { name: "Models", path: "/models", icon: Brain, protected: true },
  { name: "Experiments", path: "/experiments", icon: FlaskConical, protected: true },
  { name: "CyberGames", path: "/cybergames", icon: Gamepad2, protected: true },
  { name: "Settings", path: "/settings", icon: Settings, protected: true },
];

export const publicNavItems: NavItem[] = [
  { name: "About", path: "/about", icon: Info },
  { name: "Contact", path: "/contact", icon: Mail },
];

export const features = [
  {
    title: "Neural Architecture Lab",
    description:
      "Design and train neural networks with our visual layer editor. Drag, drop, and wire layers like a pro — no boilerplate code needed.",
    icon: "🧠",
    gradient: "from-cyan-500/20 to-cyan-600/5",
  },
  {
    title: "C++ Inference Engine",
    description:
      "Blazing-fast inference powered by a custom C++ backend. Deploy models that run at native speed with zero runtime overhead.",
    icon: "⚡",
    gradient: "from-violet-500/20 to-violet-600/5",
  },
  {
    title: "Experiment Tracking",
    description:
      "Version your models, track metrics in real-time, and compare runs. Every hyperparameter, every loss curve — immortalized.",
    icon: "📊",
    gradient: "from-cyan-500/20 to-violet-600/5",
  },
  {
    title: "WebSocket Live Training",
    description:
      "Watch your models learn in real-time. WebSocket streams push epoch losses and accuracy straight to your dashboard.",
    icon: "🔴",
    gradient: "from-violet-500/20 to-cyan-600/5",
  },
  {
    title: "CyberGames Arena",
    description:
      "Challenge other hackers in ML competitions. Train models under constraints, climb the leaderboard, and earn your hex.",
    icon: "🏆",
    gradient: "from-cyan-500/20 to-violet-600/5",
  },
  {
    title: "API-First Design",
    description:
      "Every feature is API-accessible. Integrate CyberHex into your pipeline — train, evaluate, and deploy programmatically.",
    icon: "🔌",
    gradient: "from-violet-500/20 to-cyan-600/5",
  },
];

export const stats = [
  { label: "Models Trained", value: "12,847+", suffix: "" },
  { label: "Active Users", value: "3,200+", suffix: "" },
  { label: "Avg Inference", value: "0.4", suffix: "ms" },
  { label: "Uptime", value: "99.99", suffix: "%" },
];