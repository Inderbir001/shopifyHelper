import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-lg min-w-[280px] max-w-sm
              animate-slide-in
              ${toast.type === "success"
                ? "bg-white border border-green-200"
                : "bg-white border border-red-200"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} />
            ) : (
              <XCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            )}

            <p className={`flex-1 text-sm font-medium leading-snug ${toast.type === "success" ? "text-gray-800" : "text-gray-800"}`}>
              {toast.message}
            </p>

            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
