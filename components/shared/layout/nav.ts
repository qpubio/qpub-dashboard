import {
  Activity,
  Key,
  LayoutDashboard,
  Link2,
  Radio,
  Server,
  Settings,
  Terminal,
  Users,
  Workflow,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/queues", label: "Queues", icon: Workflow },
  { href: "/connections", label: "Connections", icon: Link2 },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/events", label: "Events", icon: Radio },
  { href: "/console", label: "Console", icon: Terminal },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
