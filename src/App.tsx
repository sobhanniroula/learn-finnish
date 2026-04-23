import { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  BrainCircuit,
  Mic,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useAppStore } from "./store";
import { Dashboard } from "./components/Dashboard";
import { Vocabulary } from "./components/Vocabulary";
import { Exercises } from "./components/Exercises";
import { Pronunciation } from "./components/Pronunciation";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, playToday } = useAppStore();

  useEffect(() => {
    playToday();
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const navItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
    { id: "exercises", label: "Exercises", icon: BrainCircuit },
    { id: "pronunciation", label: "Pronunciation", icon: Mic },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0F1115] text-slate-200 font-sans overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#16191F] border-b border-slate-800 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#003580] rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
            F
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            Learn Finnish
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <nav
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#16191F] border-r border-slate-800 transform transition-transform duration-300 flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}
      >
        <div className="p-8 hidden md:flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#003580] rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
            F
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            Learn Finnish
          </span>
        </div>

        <div className="flex-1 px-4 py-8 md:py-0 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                  ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }
                `}
              >
                <Icon size={20} className={isActive ? "text-white" : ""} />
                <span className={isActive ? "font-medium" : ""}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Theme toggle desktop */}
        <div className="p-8 hidden md:block">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 font-medium"
          >
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto px-4 md:px-10 py-8 scroll-smooth">
        <div className="w-full max-w-5xl mx-auto">
          {activeTab === "home" && (
            <Dashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === "vocabulary" && <Vocabulary />}
          {activeTab === "exercises" && <Exercises />}
          {activeTab === "pronunciation" && <Pronunciation />}
        </div>
      </main>
    </div>
  );
}
