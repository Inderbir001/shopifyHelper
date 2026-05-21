import { useState } from "react";
import { Hash } from "lucide-react";
import { createOrderApi } from "../../api/orderApi";
import { buildOrderPayload } from "../../utils/orderPayload";

function OrderForm() {
  const [storeUrl, setStoreUrl] = useState("");
  const [token, setToken] = useState("");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(10);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const orderData = buildOrderPayload({
        variantId,
        quantity,
        price,
      });

      await createOrderApi({ ...orderData, storeUrl, token });

      alert("Order Created Successfully");

      setQuantity(1);
      setPrice(10);
    } catch (error) {
      console.log(error);

      alert("Failed To Create Order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-120000 p-8">
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
              onChange={(e) => setStoreUrl(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg"
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
              onChange={(e) => setToken(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg"
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
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg"
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
                  className="w-full border-2 border-gray-200 focus:border-purple-500 outline-none rounded-2xl py-4 pl-12 pr-4 text-lg"
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
                className="w-full border-2 border-gray-200 focus:border-purple-500 outline-none rounded-2xl py-4 px-4 text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl text-xl font-semibold hover:opacity-90 transition-all"
          >
            {loading ? "Creating Order..." : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
