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

      const orderData = buildOrderPayload({
        variantId,
        quantity,
        price,
        addressPreset,
      });

      await createOrderApi({ ...orderData, storeUrl, token });

      addActivity(
        "order",
        `Order created on ${storeUrl} — variant ${variantId}, qty ${quantity}`,
      );
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

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-3 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-10 mb-8">
          {/* <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
            <ShoppingBag className="text-purple-600" size={30} />
          </div> */}

          <div>
            <h2 className="text-4xl font-bold text-gray-800">
              Create New Order
            </h2>

            <p className="text-gray-500 mt-1">Fill order details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-semibold text-gray-700 block mb-3">
              Store URL
            </label>
            <input
              type="text"
              placeholder="your-store.myshopify.com"
              value={storeUrl}
              onChange={(e) => {
                setStoreUrl(e.target.value);
                localStorage.setItem("order_storeUrl", e.target.value);
              }}
              className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-3">
              Access Token
            </label>
            <input
              type="text"
              placeholder="shpat_..."
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                localStorage.setItem("order_token", e.target.value);
              }}
              className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="font-semibold text-gray-700 block mb-3">
                Variant ID
              </label>

              <input
                type="number"
                value={variantId}
                onChange={(e) => {
                  setVariantId(e.target.value);
                  localStorage.setItem("order_variantId", e.target.value);
                }}
                className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-3">
                Quantity
              </label>

              <div className="relative">
                <Hash
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 pl-12 pr-4 text-lg transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-3">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-3">
              Shipping Address
            </label>
            <select
              value={addressPreset}
              onChange={(e) => setAddressPreset(e.target.value)}
              className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg transition-colors cursor-pointer"
            >
              {Object.entries(ADDRESS_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.label} — {preset.address1}, {preset.city}, {preset.zip}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl text-xl font-semibold transition-all flex items-center justify-center gap-3 ${loading ? "opacity-80 cursor-not-allowed pointer-events-none" : "hover:opacity-90"}`}
          >
            {loading ? (
              <>
                <Loader2 className="btn-spinner shrink-0" size={24} />
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
