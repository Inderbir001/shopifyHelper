import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function StoreSetupForm({ title, description, onRun }) {
  const [store, setStore] = useState(() => localStorage.getItem("setup_store") ?? "");
  const [token, setToken] = useState(() => localStorage.getItem("setup_token") ?? "");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const logsEndRef = useRef(null);
  const esRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => () => esRef.current?.close(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setStatus(null);

    const es = new EventSource("http://localhost:5000/api/stores/stream");
    esRef.current = es;
    es.onmessage = (ev) => {
      const { message } = JSON.parse(ev.data);
      setLogs((prev) => [...prev, message]);
    };

    try {
      await onRun(store, token);
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
      es.close();
      esRef.current = null;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-3 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-semibold text-gray-700 block mb-3">Store URL</label>
            <input
              type="text"
              placeholder="your-store.myshopify.com"
              value={store}
              onChange={(e) => { setStore(e.target.value); localStorage.setItem("setup_store", e.target.value); }}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors disabled:opacity-60"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-3">Access Token</label>
            <input
              type="text"
              placeholder="shpat_..."
              value={token}
              onChange={(e) => { setToken(e.target.value); localStorage.setItem("setup_token", e.target.value); }}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors disabled:opacity-60"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl text-xl font-semibold transition-all flex items-center justify-center gap-3 ${loading ? "opacity-80 cursor-not-allowed pointer-events-none" : "hover:opacity-90"}`}
          >
            {loading ? (
              <>
                <Loader2 className="btn-spinner shrink-0" size={24} />
                <span>Running...</span>
              </>
            ) : (
              `Run: ${title}`
            )}
          </button>
        </form>
      </div>

      {(loading || logs.length > 0) && (
        <div className="col-span-3 bg-[#0B1120] rounded-0xl border border-slate-800 overflow-hidden">
          <div className="px-8 py-5 border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Live Logs</h3>
              <p className="text-slate-400 mt-1 text-sm">Real-time progress</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              {loading ? (
                <>
                  <Loader2 size={18} className="btn-spinner text-purple-400" />
                  <span className="text-purple-400">Running...</span>
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-emerald-400">Done</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-400" />
                  <span className="text-red-400">Failed</span>
                </>
              )}
            </div>
          </div>
          <div style={{ backgroundColor: "#0B1120", borderRadius: "0rem", padding: "2rem", maxHeight: "20rem", overflowY: "auto" }}>
            <pre style={{ fontSize: "0.875rem", lineHeight: "2rem", whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "monospace", margin: 0 }}>
              {logs.map((line, i) => (
                <span key={i} style={{ color: line.startsWith("[ERROR]") ? "#f87171" : "#4ade80", display: "block" }}>{line}</span>
              ))}
              <span ref={logsEndRef} />
            </pre>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="col-span-3 bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex items-center gap-4">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={28} />
          <div>
            <p className="font-semibold text-emerald-800 text-lg">Completed successfully</p>
            <p className="text-emerald-600 text-sm mt-1">{title} finished with no errors.</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="col-span-3 bg-red-50 border border-red-200 rounded-3xl p-6 flex items-center gap-4">
          <XCircle className="text-red-500 shrink-0" size={28} />
          <div>
            <p className="font-semibold text-red-800 text-lg">Operation failed</p>
            <p className="text-red-600 text-sm mt-1">Check the logs above for details.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreSetupForm;
