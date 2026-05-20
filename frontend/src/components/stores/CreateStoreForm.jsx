// frontend/src/components/stores/CreateStoreForm.jsx

import { useState } from "react";

import {
  Store,
  Package,
  Loader2,
  CheckCircle2,
  ExternalLink,
  KeyRound,
} from "lucide-react";

import { createStoreApi } from "../../api/storeApi";

function CreateStoreForm() {
  const [storeName, setStoreName] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      setResult(null);

      const response = await createStoreApi({
        storeName,
      });

      setResult(response.data);

      alert("Store Created Successfully");
    } catch (error) {
      console.log(error);

      alert("Failed To Create Store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      {/* LEFT SECTION */}

      <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 flex items-center justify-center">
            <Store className="text-purple-600" size={38} />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-800">
              Shopify Store Automation
            </h2>

            <p className="text-gray-500 mt-2 text-lg">
              Create store, generate token and import CSV products automatically
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="font-semibold text-gray-700 block mb-3 text-lg">
              Store Name
            </label>

            <div className="relative">
              <Store
                className="absolute left-5 top-5 text-gray-400"
                size={22}
              />

              <input
                type="text"
                placeholder="Enter store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-purple-500 outline-none rounded-2xl py-5 pl-14 pr-5 text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl text-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Creating Store...
              </>
            ) : (
              <>
                <Package size={24} />
                Create Store & Import Products
              </>
            )}
          </button>
        </form>
      </div>

      {/* RIGHT SECTION */}

      <div className="col-span-1 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Automation Flow
          </h3>

          <div className="space-y-5">
            {[
              "Create Development Store",
              "Enable Custom Apps",
              "Create Legacy App",
              "Generate Admin Token",
              "Import CSV Products",
            ].map((step) => (
              <div key={step} className="flex items-center gap-4">
                <CheckCircle2 className="text-green-500" size={22} />

                <span className="text-gray-700 text-lg">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-3xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Environment Details
            </h3>

            <div className="bg-[#0B1120] rounded-2xl p-6 overflow-auto">
              <pre className="text-green-400 text-sm leading-8 whitespace-pre-wrap">
                {`PARTNER_URL = ${result.partnerUrl}

SHOPIFYURL = ${result.storeUrl}

APPURL = ${result.appUrl}

USER_EMAIL = inderbir@pluginhive.com

USER_PASSWORD = Inderbir@123!

STORE_PASSWORD = 

SHOPIFY_API_VERSION = 2023-01

SHOPIFY_STORE_NAME = ${result.storeName}

SHOPIFY_ACCESS_TOKEN = ${result.token}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateStoreForm;
