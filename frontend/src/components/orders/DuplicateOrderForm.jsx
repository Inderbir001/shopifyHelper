import { useState, useRef } from "react";
import { Hash, Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { duplicateOrderApi } from "../../api/orderApi";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_RETRIES = 50;
const ORDER_INTERVAL_MS = 16_000;
const PAGE_SIZE = 20;

function DuplicateOrderForm() {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [storeUrl, setStoreUrl] = useState(() => localStorage.getItem("order_storeUrl") ?? "");
  const [token, setToken]       = useState(() => localStorage.getItem("order_token") ?? "");
  const [orderName, setOrderName] = useState("");
  const [count, setCount]         = useState(1);

  const [loading, setLoading]             = useState(false);
  const [progress, setProgress]           = useState(null);
  const [createdOrders, setCreatedOrders] = useState([]);
  const [page, setPage]                   = useState(1);

  const cancelRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    cancelRef.current = false;
    setLoading(true);
    setProgress({ done: 0, total: count });
    setCreatedOrders([]);
    setPage(1);

    let done = 0;

    try {
      for (let i = 0; i < count; i++) {
        if (cancelRef.current) break;

        if (count > 5 && i > 0) await sleep(ORDER_INTERVAL_MS);

        if (cancelRef.current) break;

        // Silent retry loop
        let result;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          if (cancelRef.current) break;
          try {
            result = await duplicateOrderApi(storeUrl, token, orderName);
            break;
          } catch (err) {
            if (attempt === MAX_RETRIES) throw err;
            await sleep(err.response?.status === 429 ? 65_000 : 3_000);
          }
        }
        if (!result) break;

        const order = result.order;
        done += 1;

        setCreatedOrders((prev) => [
          {
            id: order.id,
            name: order.name,
            source: result.source?.name ?? orderName,
            status: order.financial_status,
            total: order.total_price,
            currency: order.currency,
            createdAt: new Date(order.created_at).toLocaleTimeString(),
          },
          ...prev,
        ]);
        setProgress({ done, total: count });
        addActivity("order", `Duplicated ${orderName} → ${order.name} on ${storeUrl}`);
      }

      showToast(`${done} order${done !== 1 ? "s" : ""} duplicated!`, "success");
    } catch (error) {
      console.log(error);
      showToast(error.response?.data?.error ?? "Failed to duplicate order.", "error");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const inputCls = "w-full bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors disabled:opacity-60";

  const statusColor = (s) => {
    if (s === "paid")    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "pending") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400";
  };

  const totalPages = Math.max(1, Math.ceil(createdOrders.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageOrders = createdOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Duplicate Order</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-0.5 text-sm">Re-create an existing order with the same details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Store URL</label>
            <input type="text" placeholder="your-store.myshopify.com" value={storeUrl}
              onChange={(e) => { setStoreUrl(e.target.value); localStorage.setItem("order_storeUrl", e.target.value); }}
              className={inputCls} required />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Access Token</label>
            <input type="text" placeholder="shpat_..." value={token}
              onChange={(e) => { setToken(e.target.value); localStorage.setItem("order_token", e.target.value); }}
              className={inputCls} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Order Number</label>
              <input type="text" placeholder="#1001 or 1001" value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                disabled={loading}
                className={inputCls} required />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">
                Times to Duplicate
                <span className="ml-2 font-normal text-gray-400 dark:text-slate-500 text-xs">(&gt;5 paced at 16s each)</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" size={16} />
                <input type="number" min={1} max={500} value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`${inputCls} pl-9`} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className={`flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${loading ? "opacity-80 cursor-not-allowed pointer-events-none" : "hover:opacity-90"}`}>
              {loading ? (
                <>
                  <Loader2 className="btn-spinner shrink-0" size={20} />
                  <span>{progress ? `Duplicating ${progress.done + 1} of ${progress.total}...` : "Duplicating..."}</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Duplicate {count > 1 ? `${count}×` : ""} Order</span>
                </>
              )}
            </button>

            {loading && (
              <button type="button" onClick={() => { cancelRef.current = true; }}
                className="px-5 py-3 rounded-xl text-base font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2 shrink-0">
                <XCircle size={18} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Progress bar */}
      {loading && progress && (
        <div className="col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-2">
            <span>{progress.done} of {progress.total} duplicated</span>
            <span>{Math.round((progress.done / progress.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Duplicated orders list */}
      {createdOrders.length > 0 && (
        <div className="col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">Duplicated Orders</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{createdOrders.length} order{createdOrders.length !== 1 ? "s" : ""} this session</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 size={16} />
              <span className="text-xs font-semibold">{createdOrders.length} created</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">New Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Source</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((order, idx) => {
                  const globalIdx = (safePage - 1) * PAGE_SIZE + idx;
                  return (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-3 text-xs text-gray-400 dark:text-slate-500">{createdOrders.length - globalIdx}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 dark:text-slate-100">{order.name}</td>
                      <td className="px-6 py-3 text-gray-500 dark:text-slate-400 text-xs">{order.source}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700 dark:text-slate-300">{order.currency} {order.total}</td>
                      <td className="px-6 py-3 text-gray-400 dark:text-slate-500 text-xs">{order.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Page {safePage} of {totalPages} — {createdOrders.length} total
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-purple-400 hover:text-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${p === safePage ? "bg-purple-600 text-white" : "border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-purple-400 hover:text-purple-500"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-purple-400 hover:text-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DuplicateOrderForm;
