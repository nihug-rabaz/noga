import { motion } from "framer-motion";

type Props = {
  onGetStarted: () => void;
  onLogin: () => void;
};

export function HomePage(props: Props) {
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src="/logo/logo.png" alt="noga logo" className="h-7 w-auto" />
          <span className="text-sm font-semibold tracking-wide">noga</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            className="px-3 py-1.5 rounded-full border border-slate-700 text-slate-200"
            onClick={props.onLogin}
          >
            Log in
          </button>
          <button
            className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-950 font-medium"
            onClick={props.onGetStarted}
          >
            Get started
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 px-8 md:px-16 py-10 flex flex-col justify-center gap-6">
          <div className="text-xs text-emerald-400 font-medium tracking-wide">
            noga • internal DB platform
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            Ship faster with SQLite branches
            <br />
            for secure engineering teams
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Create logical projects, spin up branches per feature, and share ENV-based
            connections across applications. All inside your closed network, with no
            external cloud dependencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            <button
              className="px-4 py-2 rounded-full bg-slate-50 text-slate-950 font-medium"
              onClick={props.onGetStarted}
            >
              Get started
            </button>
            <button
              className="px-4 py-2 rounded-full border border-slate-700 text-slate-200"
              onClick={props.onLogin}
            >
              Enter console
            </button>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden flex items-center justify-center px-8 py-10">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e,_transparent_55%)] opacity-40"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#38bdf8,_transparent_55%)] opacity-30"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <div className="relative z-10 w-full max-w-lg h-64 md:h-80 rounded-3xl border border-slate-700 bg-slate-950/80 overflow-hidden flex items-center justify-center">
            <div className="flex gap-2 h-40 w-full px-8">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <motion.div
                  key={index}
                  className="flex-1 rounded-full bg-gradient-to-b from-emerald-400 via-sky-400 to-transparent"
                  initial={{ scaleY: 0.2 }}
                  animate={{ scaleY: [0.2, 1, 0.4, 0.8, 0.2] }}
                  transition={{
                    duration: 4 + index,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  style={{ transformOrigin: "bottom" }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

