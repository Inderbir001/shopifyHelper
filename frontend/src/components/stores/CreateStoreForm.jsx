import { Package, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { useStoreCreation } from "../../context/StoreCreationContext";

function CreateStoreForm() {
  const {
    storeName,
    setStoreName,
    loading,
    result,
    cancelled,
    startCreation,
    cancelCreation,
  } = useStoreCreation();

  const handleSubmit = (e) => {
    e.preventDefault();
    startCreation();
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-3 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-10 mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-800">Create Store</h2>
            <p className="text-gray-500 mt-1">
              Create Shopify development stores automatically
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-semibold text-gray-700 block mb-3">
              Store Name
            </label>
            <input
              type="text"
              placeholder="Enter store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors disabled:opacity-60"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl text-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin shrink-0" size={24} />
                  <span>Creating Store...</span>
                </>
              ) : (
                <>
                  <Package className="shrink-0" size={24} />
                  <span>Create Store & Import Products</span>
                </>
              )}
            </button>

            {loading && (
              <button
                type="button"
                onClick={cancelCreation}
                className="mt-4 px-8 py-5 rounded-2xl text-xl font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 shrink-0"
              >
                <XCircle size={22} className="shrink-0" />
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

      {result && (
        <div className="col-span-3 bg-[#0B1120] rounded-0xl border border-slate-800 overflow-hidden">
          <div className="px-8 py-5  border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-black">
                Environment Details
              </h3>
              <p className="text-slate-400 mt-1 text-sm">
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
