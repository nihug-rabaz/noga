import { useState } from "react";
import { motion } from "framer-motion";
import type { NogaClient } from "../utils/NogaClient";

type Props = {
  client: NogaClient;
  onAuthenticated: () => void;
};

type Mode = "login" | "register";

export function AuthView(props: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password || (mode === "register" && !name)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        await props.client.register(email, name, password);
      } else {
        await props.client.login(email, password);
      }
      props.onAuthenticated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-50">
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#38bdf8,_transparent_55%)] opacity-40"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#22c55e,_transparent_55%)] opacity-40"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="relative z-10 flex flex-col items-center gap-4 px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-semibold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            noga
          </motion.div>
          <div className="text-2xl font-semibold text-center">
            SQLite branches for secure internal networks
          </div>
          <div className="text-sm text-slate-300 text-center max-w-md">
            Create logical projects, branch your data safely, and share ENV-based
            connections across your internal applications without any external internet.
          </div>
        </motion.div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-slate-900 md:bg-slate-950/60">
        <motion.div
          className="w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-800 px-6 py-6 shadow-xl"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
              Welcome to noga
            </div>
            <div className="text-lg font-semibold">
              {mode === "login" ? "Sign in to your console" : "Create your operator account"}
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Email</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-slate-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            {mode === "register" && (
              <div>
                <label className="block text-slate-300 mb-1">Name</label>
                <input
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-slate-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-slate-300 mb-1">Password</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs outline-none focus:border-slate-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>
          </div>
          {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
          <div className="mt-5 flex flex-col gap-3">
            <button
              className="w-full rounded-md bg-slate-50 text-slate-950 text-xs font-medium py-2 disabled:opacity-40"
              disabled={loading}
              onClick={submit}
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
            <button
              className="w-full rounded-md border border-slate-700 text-slate-300 text-[11px] py-2"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
            >
              {mode === "login"
                ? "Need an account? Register as operator"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

