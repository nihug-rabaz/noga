import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { NogaClient, LogicalDatabase } from "../utils/NogaClient";
import type { SelectedDatabase } from "./App";

type Props = {
  client: NogaClient;
  onOpenDb: (db: SelectedDatabase) => void;
};

type CreateState = {
  id: string;
  description: string;
  isOpen: boolean;
  isSubmitting: boolean;
};

export function Dashboard(props: Props) {
  const [databases, setDatabases] = useState<LogicalDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createState, setCreateState] = useState<CreateState>({
    id: "",
    description: "",
    isOpen: false,
    isSubmitting: false
  });

  useEffect(() => {
    props.client
      .listDatabases()
      .then(setDatabases)
      .finally(() => setLoading(false));
  }, [props.client]);

  const openDb = (db: LogicalDatabase) => {
    props.onOpenDb({
      id: db.id,
      description: db.description,
      createdAt: db.createdAt
    });
  };

  const toggleCreate = () => {
    setCreateState({
      id: "",
      description: "",
      isOpen: !createState.isOpen,
      isSubmitting: false
    });
  };

  const submitCreate = async () => {
    if (!createState.id) {
      return;
    }
    setCreateState({ ...createState, isSubmitting: true });
    await props.client.createDatabase(createState.id, createState.description || null);
    const list = await props.client.listDatabases();
    setDatabases(list);
    setCreateState({
      id: "",
      description: "",
      isOpen: false,
      isSubmitting: false
    });
  };

  return (
    <div className="h-full flex flex-col px-8 py-6 gap-6 bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-900">YOSEF&apos;s projects</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-700">
            Import data
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-3 py-2 rounded-md bg-slate-900 text-sm text-white"
            onClick={toggleCreate}
          >
            New project
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <MetricCard label="Compute" value="0 CU-hrs" />
        <MetricCard label="Storage" value="0 GB" />
        <MetricCard label="History" value="0 GB" />
        <MetricCard label="Network transfer" value="0 GB" />
      </div>

      <div className="flex-1 rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-700">Projects</div>
          <div className="w-64">
            <input
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-slate-900"
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="px-4 py-6 text-xs text-slate-500">
              Loading projects...
            </div>
          )}
          {!loading && databases.length === 0 && (
            <div className="px-4 py-6 text-xs text-slate-500">
              No projects yet. Click &quot;New project&quot; to create one.
            </div>
          )}
          {!loading && databases.length > 0 && (
            <table className="w-full text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left font-medium px-4 py-2 w-1/3">Name</th>
                  <th className="text-left font-medium px-4 py-2">Region</th>
                  <th className="text-left font-medium px-4 py-2">Created at</th>
                  <th className="text-left font-medium px-4 py-2">Branches</th>
                  <th className="text-left font-medium px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {databases.map((db, index) => (
                  <tr
                    key={db.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="px-4 py-2">
                      <button
                        className="flex items-center gap-2 text-slate-900 hover:underline"
                        onClick={() => openDb(db)}
                      >
                        <span className="h-3 w-3 rounded-sm border border-slate-400" />
                        <span>{db.id}</span>
                      </button>
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      Local cluster
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {new Date(db.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-slate-500">1</td>
                    <td className="px-4 py-2 text-slate-500">
                      <button className="text-slate-500 hover:text-slate-900">
                        ⋯
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {createState.isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden flex"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-1/2 p-6 flex flex-col gap-4">
              <div className="text-sm font-medium text-slate-900">Create project</div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Project name</label>
                  <input
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-slate-900"
                    value={createState.id}
                    onChange={(e) => setCreateState({ ...createState, id: e.target.value })}
                    placeholder="e.g. app name"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Description</label>
                  <textarea
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-slate-900 min-h-[56px]"
                    value={createState.description}
                    onChange={(e) => setCreateState({ ...createState, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-auto flex justify-end gap-2 text-xs">
                <button
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700"
                  onClick={toggleCreate}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 rounded-md bg-slate-900 text-white disabled:opacity-40"
                  disabled={!createState.id || createState.isSubmitting}
                  onClick={submitCreate}
                >
                  Create
                </button>
              </div>
            </div>
            <div className="w-1/2 bg-slate-900 relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#38bdf8,_transparent_55%)]" />
              <div className="relative h-52 w-52 rounded-full border border-slate-600 bg-[radial-gradient(circle_at_center,_#0f172a,_#020617)] flex items-center justify-center overflow-hidden">
                <div className="h-full w-full bg-[radial-gradient(circle,_#e5e7eb_1px,_transparent_1px)] bg-[length:6px_6px] opacity-60 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard(props: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-col gap-1 shadow-sm">
      <div className="text-[11px] text-slate-500">{props.label}</div>
      <div className="text-sm font-semibold text-slate-900">{props.value}</div>
    </div>
  );
}

