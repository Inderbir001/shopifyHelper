import { useEffect, useRef } from "react";
import { Package, Loader2, XCircle, CheckCircle2, Terminal } from "lucide-react";
import { useStoreCreation } from "../../context/StoreCreationContext";

function CreateStoreForm() {
  const {
    storeName,
    setStoreName,
    loading,
    result,
    cancelled,
    logs,
    startCreation,
    cancelCreation,
  } = useStoreCreation();

  const logsEndRef = useRef(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    startCreation();
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-3 bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-800">Create Store</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            Create Shopify development stores automatically
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700 block mb-1.5 text-sm">
              Store Name
            </label>
            <input
              type="text"
              placeholder="Enter store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-xl py-2.5 px-3 text-sm transition-colors disabled:opacity-60"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${loading ? "opacity-80 cursor-not-allowed pointer-events-none" : "hover:opacity-90"}`}
            >
              {loading ? (
                <>
                  <Loader2 className="btn-spinner shrink-0" size={20} />
                  <span>Creating Store...</span>
                </>
              ) : (
                <>
                  <Package className="shrink-0" size={20} />
                  <span>Create Store</span>
                </>
              )}
            </button>

            {loading && (
              <button
                type="button"
                onClick={cancelCreation}
                className="mt-2 px-6 py-3 rounded-xl text-base font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 shrink-0"
              >
                <XCircle size={18} className="shrink-0" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {cancelled && (
            <p className="text-red-500 text-sm font-medium">
              Store creation was cancelled.
            </p>
          )}
        </form>
      </div>

      {(loading || logs.length > 0) && (
        <div className="col-span-3 bg-[#0B1120] rounded-0xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live Logs</h3>
              <p className="text-slate-400 mt-0.5 text-xs">Real-time store creation progress</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              {loading ? (
                <>
                  <Loader2 size={18} className="btn-spinner text-purple-400" />
                  <span className="text-purple-400">Running...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-emerald-400">Done</span>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#0B1120",
              borderRadius: "0rem",
              padding: "2rem",
              maxHeight: "20rem",
              overflowY: "auto",
            }}
          >
            <pre
              style={{
                fontSize: "0.875rem",
                lineHeight: "2rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              {logs.map((line, i) => (
                <span
                  key={i}
                  style={{ color: line.startsWith("[ERROR]") ? "#f87171" : "#4ade80", display: "block" }}
                >
                  {line}
                </span>
              ))}
              <span ref={logsEndRef} />
            </pre>
          </div>
        </div>
      )}

      {result && (
        <div className="col-span-3 bg-[#0B1120] rounded-0xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Environment Details
              </h3>
              <p className="text-slate-400 mt-0.5 text-xs">
                Generated store credentials & configuration
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 size={18} />
              <span>Ready</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#0B1120",
              borderRadius: "0rem",
              padding: "2rem",
              overflow: "auto",
            }}
          >
            <pre
              style={{
                color: "#4ade80",
                fontSize: "0.875rem",
                lineHeight: "2rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              {`PARTNER_URL = ${result.partnerUrl}
SHOPIFYURL = ${result.storeUrl}
APPURL = ${result.appUrl}
USER_EMAIL =
USER_PASSWORD =
STORE_PASSWORD =
SHOPIFY_API_VERSION = ${result.apiVersion}
SHOPIFY_STORE_NAME = ${result.storeName}
SHOPIFY_ACCESS_TOKEN = ${result.token}
SIMPLE_PRODUCTS_JSON = ${JSON.stringify(result.simpleProducts)}
VARIABLE_PRODUCTS_JSON = ${JSON.stringify(result.variableProducts)}
DIGITAL_PRODUCTS = ${JSON.stringify(result.digitalProducts)}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateStoreForm;
