import { useState } from "react";
import { Hash, Loader2 } from "lucide-react";
import { createOrderApi } from "../../api/orderApi";
import { buildOrderPayload, ADDRESS_PRESETS } from "../../utils/orderPayload";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";

function OrderForm() {
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [storeUrl, setStoreUrl] = useState(
    () => localStorage.getItem("order_storeUrl") ?? "",
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("order_token") ?? "",
  );
  const [variantId, setVariantId] = useState(
    () => localStorage.getItem("order_variantId") ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(10);
  const [addressPreset, setAddressPreset] = useState("US");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const orderData = buildOrderPayload({ variantId, quantity, price, addressPreset });
      await createOrderApi({ ...orderData, storeUrl, token });
      addActivity("order", `Order created on ${storeUrl} — variant ${variantId}, qty ${quantity}`);
      showToast("Order created successfully!", "success");
      setQuantity(1);
      setPrice(10);
    } catch (error) {
      console.log(error);
      showToast("Failed to create order. Check console for details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors disabled:opacity-60";

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Create New Order</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-0.5 text-sm">Fill order details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Store URL</label>
            <input
              type="text"
              placeholder="your-store.myshopify.com"
              value={storeUrl}
              onChange={(e) => { setStoreUrl(e.target.value); localStorage.setItem("order_storeUrl", e.target.value); }}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Access Token</label>
            <input
              type="text"
              placeholder="shpat_..."
              value={token}
              onChange={(e) => { setToken(e.target.value); localStorage.setItem("order_token", e.target.value); }}
              className={inputCls}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Variant ID</label>
              <input
                type="number"
                value={variantId}
                onChange={(e) => { setVariantId(e.target.value); localStorage.setItem("order_variantId", e.target.value); }}
                className={inputCls}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Quantity</label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" size={16} />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Shipping Address</label>
              <select
                value={addressPreset}
                onChange={(e) => setAddressPreset(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {Object.entries(ADDRESS_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label} — {preset.address1}, {preset.city}, {preset.zip}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${loading ? "opacity-80 cursor-not-allowed pointer-events-none" : "hover:opacity-90"}`}
          >
            {loading ? (
              <>
                <Loader2 className="btn-spinner shrink-0" size={20} />
                <span>Creating Order...</span>
              </>
            ) : (
              "Create Order"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
