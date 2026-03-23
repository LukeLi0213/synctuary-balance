import { Home, CheckSquare, Timer, BarChart3, Sparkles, CalendarDays } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/recovery", icon: Timer, label: "Recover" },
  { path: "/stats", icon: BarChart3, label: "Stats" },
  { path: "/avatar", icon: Sparkles, label: "Avatar" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2 px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                active
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
