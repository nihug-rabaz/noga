import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { NogaClient, Branch } from "../utils/NogaClient";
import type { SelectedDatabase } from "./App";

type Props = {
  client: NogaClient;
  database: SelectedDatabase;
  onBack: () => void;
};

type QueryState = {
  branch: string;
  sql: string;
  result: unknown[] | null;
  isRunning: boolean;
  error: string | null;
};

type EnvState = {
  value: string;
  isLoading: boolean;
};

export function DatabaseView(props: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [queryState, setQueryState] = useState<QueryState>({
    branch: "main",
    sql: "SELECT name FROM sqlite_master WHERE type = 'table';",
    result: null,
    isRunning: false,
    error: null
  });
  const [envState, setEnvState] = useState<EnvState>({
    value: "",
    isLoading: false
  });

  useEffect(() => {
    props.client.listBranches(props.database.id).then((list) => {
      setBranches(list);
      if (list.length > 0) {
        setQueryState((prev) => ({ ...prev, branch: list[0].name }));
      }
    });
  }, [props.client, props.database.id]);

  const runQuery = async () => {
    if (!queryState.sql) {
      return;
    }
    setQueryState({ ...queryState, isRunning: true, error: null });
    try {
      const rows = await props.client.runQuery(props.database.id, queryState.branch, queryState.sql);
      setQueryState({ ...queryState, isRunning: false, result: rows, error: null });
    } catch (error) {
      setQueryState({
        ...queryState,
        isRunning: false,
        error: (error as Error).message,
        result: null
      });
    }
  };

  const loadEnv = async () => {
    setEnvState({ value: "", isLoading: true });
    const env = await props.client.getEnv(props.database.id, queryState.branch);
    setEnvState({ value: env, isLoading: false });
  };

  const createBranch = async () => {
    const baseName = `branch_${branches.length + 1}`;
    await props.client.createBranch(props.database.id, baseName, queryState.branch || "main");
    const list = await props.client.listBranches(props.database.id);
    setBranches(list);
  };

  const resultPreview = () => {
    if (!queryState.result) {
      return null;
    }
    if (queryState.result.length === 0) {
      return <div className="text-xs text-white/50">No rows.</div>;
    }
    const firstRow = queryState.result[0] as Record<string, unknown>;
    const columns = Object.keys(firstRow);
    return (
      <div className="border border-white/10 rounded-xl overflow-auto max-h-64 text-xs">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/5">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-1 text-left font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(queryState.result as Record<string, unknown>[]).map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-transparent" : "bg-white/5"}>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-1 align-top text-white/80">
                    {stringifyValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      <aside className="w-64 border-r border-white/10 bg-black/30 backdrop-blur-md p-4 flex flex-col gap-4">
        <button
          className="text-xs text-white/60 mb-2 hover:text-white flex items-center gap-2"
          onClick={props.onBack}
        >
          <span className="text-lg">⟵</span>
          Back to databases
        </button>
        <div>
          <div className="text-sm font-semibold mb-1">{props.database.id}</div>
          <div className="text-[11px] text-white/50 line-clamp-3">{props.database.description || "No description"}</div>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Branches</div>
          <div className="space-y-1 max-h-48 overflow-auto">
            {branches.map((branch) => (
              <button
                key={branch.id}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                  queryState.branch === branch.name ? "bg-nogaAccent text-white" : "bg-white/5 text-white/80"
                }`}
                onClick={() => setQueryState({ ...queryState, branch: branch.name })}
              >
                {branch.name}
              </button>
            ))}
          </div>
          <button
            className="mt-2 w-full text-xs py-1.5 rounded-lg border border-dashed border-white/20 text-white/70 hover:border-nogaAccent"
            onClick={createBranch}
          >
            Duplicate branch
          </button>
        </div>
        <div className="mt-auto">
          <div className="text-xs text-white/60 mb-1">ENV block</div>
          <button
            className="w-full text-xs py-1.5 rounded-lg bg-nogaAccentSoft/20 text-nogaAccentSoft"
            onClick={loadEnv}
          >
            {envState.isLoading ? "Loading..." : "Generate ENV"}
          </button>
        </div>
      </aside>
      <section className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/60">Branch</div>
            <div className="text-lg font-semibold">{queryState.branch}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <motion.div
            className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-white/70">SQL playground</div>
              <button
                className="px-3 py-1 rounded-lg bg-nogaAccent text-xs disabled:opacity-40"
                disabled={queryState.isRunning}
                onClick={runQuery}
              >
                Run
              </button>
            </div>
            <textarea
              className="flex-1 min-h-[140px] bg-black/40 rounded-xl border border-white/10 px-3 py-2 text-xs outline-none focus:border-nogaAccent"
              value={queryState.sql}
              onChange={(e) => setQueryState({ ...queryState, sql: e.target.value })}
            />
            {queryState.error && <div className="mt-2 text-xs text-red-400">{queryState.error}</div>}
          </motion.div>
          <motion.div
            className="flex flex-col rounded-2xl bg-white/5 border border-white/10 p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="text-xs font-semibold text-white/70 mb-2">Result</div>
            <div className="flex-1">{resultPreview()}</div>
          </motion.div>
        </div>
        {envState.value && (
          <motion.div
            className="rounded-2xl bg-black/60 border border-white/15 p-3 text-[11px] font-mono text-white/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <pre className="whitespace-pre-wrap">{envState.value}</pre>
          </motion.div>
        )}
      </section>
    </div>
  );
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

