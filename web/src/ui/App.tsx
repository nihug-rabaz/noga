import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { DatabaseView } from "./DatabaseView";
import { NogaClient } from "../utils/NogaClient";
import { AuthView } from "./AuthView";
import { HomePage } from "./HomePage";

export type SelectedDatabase = {
  id: string;
  description: string | null;
  createdAt: string;
};

type View = "home" | "auth" | "console";

const client = new NogaClient("/api");

export function App() {
  const [selectedDb, setSelectedDb] = useState<SelectedDatabase | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<View>("home");

  if (!isAuthenticated && view === "home") {
    return (
      <HomePage
        onGetStarted={() => setView("auth")}
        onLogin={() => setView("auth")}
      />
    );
  }

  if (!isAuthenticated && view === "auth") {
    return (
      <AuthView
        client={client}
        onAuthenticated={() => {
          setIsAuthenticated(true);
          setView("console");
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col border-l border-slate-200 bg-white">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            {!selectedDb && (
              <motion.div
                key="dashboard"
                className="flex-1 h-full"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Dashboard client={client} onOpenDb={setSelectedDb} />
              </motion.div>
            )}
            {selectedDb && (
              <motion.div
                key="dbview"
                className="flex-1 h-full"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <DatabaseView client={client} database={selectedDb} onBack={() => setSelectedDb(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-semibold text-base">
            N
          </div>
          <div className="flex flex-col">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Console</div>
            <div className="text-sm font-medium">noga</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        <SidebarItem label="Projects" active />
        <SidebarItem label="Integrations" />
        <SidebarItem label="Settings" />
      </nav>
      <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
        noga runs on your internal network. External billing and psql access are disabled.
      </div>
    </aside>
  );
}

type SidebarItemProps = {
  label: string;
  active?: boolean;
};

function SidebarItem(props: SidebarItemProps) {
  const base =
    "w-full flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 text-slate-700";
  const active = props.active ? " bg-slate-900 text-white hover:bg-slate-900" : "";
  return (
    <div className={base + active}>
      <span className="h-2 w-2 rounded-sm border border-current" />
      <span>{props.label}</span>
    </div>
  );
}

function TopBar() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold">Projects</div>
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-[2px] text-xs text-emerald-700">
          Scale
        </span>
      </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-[2px] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>All OK (internal)</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            N
          </div>
      </div>
    </header>
  );
}

