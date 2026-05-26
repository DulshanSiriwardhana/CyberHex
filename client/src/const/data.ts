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
  { name: "Settings", path: "/settings", icon: Settings, protected: true },
];

export const publicNavItems: NavItem[] = [];

export const features = [
  {
    title: "Neural Architecture Lab",
    description:
      "Visually design deep networks with a drag-and-drop layer editor. Dense, GELU, Batch Norm, Dropout, Multi-Head Attention — wire them like a senior ML engineer. No boilerplate required.",
    icon: "🧠",
    gradient: "from-green-500/20 to-green-600/5",
  },
  {
    title: "Ultra-Max-Pro ML Engine",
    description:
      "AdamW · RAdam · Lion · Cosine Annealing · Gradient Clipping · Label Smoothing · Early Stopping · Ensemble Checkpointing. World-class training primitives — infinite IQ, zero compromise.",
    icon: "⚡",
    gradient: "from-violet-500/20 to-violet-600/5",
  },
  {
    title: "Real-Time Experiment Tracking",
    description:
      "Stream epoch loss, accuracy, F1, precision, recall, and dead-neuron ratios to your live dashboard via WebSocket. Every hyperparameter, every curve — immortalized.",
    icon: "📊",
    gradient: "from-green-500/20 to-violet-600/5",
  },
  {
    title: "AutoML Hyperparameter Search",
    description:
      "Run a Bayesian-inspired search across 27 candidates — architectures, optimizers, dropout, LR schedules. Progressive band elimination finds the champion configuration automatically.",
    icon: "🔬",
    gradient: "from-violet-500/20 to-green-600/5",
  },
  {
    title: "Cyber Security Datasets",
    description:
      "Pre-loaded with DARPA-style cyber intrusion logs, DDoS flow telemetry, and IIoT sensor streams. Train threat detection models out of the box — no data wrangling.",
    icon: "🛡️",
    gradient: "from-green-500/20 to-violet-600/5",
  },
  {
    title: "API-First & Open",
    description:
      "Every feature is API-accessible via a documented REST + WebSocket interface. Integrate CyberHex into your MLOps pipeline — train, evaluate, infer, and deploy programmatically.",
    icon: "🔌",
    gradient: "from-violet-500/20 to-green-600/5",
  },
];

export const stats = [
  { label: "Models Trained", value: "48,291+", suffix: "" },
  { label: "Active Engineers", value: "12,400+", suffix: "" },
  { label: "Avg Inference", value: "0.38", suffix: "ms" },
  { label: "Uptime", value: "99.99", suffix: "%" },
];
