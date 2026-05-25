import { useState, useRef } from "react";
import { Hash, Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Sliders } from "lucide-react";
import { faker } from "@faker-js/faker";
import { createOrderApi } from "../../api/orderApi";
import { ADDRESS_PRESETS } from "../../utils/orderPayload";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_RETRIES = 50;
const ORDER_INTERVAL_MS = 16_000;
const PAGE_SIZE = 20;

// ─── Field definitions ────────────────────────────────────────────────────────
const FIELD_GROUPS = [
  {
    label: "Line Item",
    fields: [
      { key: "variant_id",         label: "Variant ID",         type: "number",  placeholder: "46204783198466", default: "",      required: true },
      { key: "quantity",           label: "Quantity",           type: "number",  placeholder: "1",              default: "1",     required: true },
      { key: "price",              label: "Price",              type: "number",  placeholder: "10.00",          default: "10.00", required: true },
      { key: "requires_shipping",  label: "Requires Shipping",  type: "select",  options: [["true","Yes"],["false","No"]],        default: "true" },
      { key: "taxable",            label: "Taxable",            type: "select",  options: [["true","Yes"],["false","No"]],        default: "true" },
    ],
  },
  {
    label: "Financial",
    fields: [
      { key: "financial_status", label: "Financial Status", type: "select",
        options: [["paid","Paid"],["pending","Pending"],["authorized","Authorized"],["partially_paid","Partially Paid"],["refunded","Refunded"],["voided","Voided"]],
        default: "paid" },
      { key: "currency", label: "Currency", type: "text", placeholder: "USD", default: "USD" },
    ],
  },
  {
    label: "Payment / Transaction",
    fields: [
      { key: "txn_gateway", label: "Gateway", type: "select",
        options: [["bogus","Bogus (test)"],["manual","Manual"],["cash_on_delivery","Cash on Delivery"],["gift_card","Gift Card"]],
        default: "bogus" },
      { key: "txn_kind", label: "Kind", type: "select",
        options: [["sale","Sale"],["authorization","Authorization"],["capture","Capture"],["void","Void"],["refund","Refund"]],
        default: "sale" },
      { key: "txn_status", label: "Status", type: "select",
        options: [["success","Success"],["pending","Pending"],["failure","Failure"],["error","Error"]],
        default: "success" },
      { key: "txn_amount", label: "Amount (leave blank = price)", type: "number", placeholder: "10.00", default: "" },
    ],
  },
  {
    label: "Shipping Method",
    fields: [
      { key: "shipping_title", label: "Method Title",      type: "text",   placeholder: "Standard Shipping", default: "Standard Shipping" },
      { key: "shipping_price", label: "Shipping Price",    type: "number", placeholder: "0.00",              default: "0.00" },
      { key: "fulfillment_status", label: "Fulfillment Status", type: "select",
        options: [["null","Unfulfilled"],["fulfilled","Fulfilled"],["partial","Partial"]],
        default: "null" },
    ],
  },
  {
    label: "Customer",
    fields: [
      { key: "email",      label: "Email",      type: "text", placeholder: "customer@example.com", default: "" },
      { key: "phone",      label: "Phone",      type: "text", placeholder: "+1 555 555 5555",       default: "" },
      { key: "first_name", label: "First Name", type: "text", placeholder: "John",                 default: "" },
      { key: "last_name",  label: "Last Name",  type: "text", placeholder: "Doe",                  default: "" },
      { key: "company",    label: "Company",    type: "text", placeholder: "Acme Inc.",             default: "" },
    ],
  },
  {
    label: "Order Details",
    fields: [
      { key: "note",        label: "Note",        type: "text", placeholder: "Order note...",    default: "Created from Shopify Helper" },
      { key: "tags",        label: "Tags",        type: "text", placeholder: "tag1,tag2",        default: "shopify-helper,test-order" },
      { key: "source_name", label: "Source Name", type: "text", placeholder: "web",              default: "shopify-helper" },
    ],
  },
  {
    label: "Settings",
    fields: [
      { key: "send_receipt",         label: "Send Receipt Email",  type: "select", options: [["false","No"],["true","Yes"]], default: "false" },
      { key: "taxes_included",       label: "Taxes Included",      type: "select", options: [["false","No"],["true","Yes"]], default: "false" },
      { key: "tax_exempt",           label: "Tax Exempt",          type: "select", options: [["false","No"],["true","Yes"]], default: "false" },
      { key: "inventory_behaviour",  label: "Inventory Behaviour", type: "select",
        options: [["bypass","Bypass"],["decrement_ignoring_policy","Decrement (ignore policy)"],["decrement_obeying_policy","Decrement (obey policy)"]],
        default: "bypass" },
    ],
  },
];

const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields);
const defaultOf  = (key) => ALL_FIELDS.find((f) => f.key === key)?.default ?? "";

// ─── Component ────────────────────────────────────────────────────────────────
function CustomOrderForm() {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();

  const [storeUrl, setStoreUrl] = useState(() => localStorage.getItem("order_storeUrl") ?? "");
  const [token, setToken]       = useState(() => localStorage.getItem("order_token") ?? "");
  const [addressPreset, setAddressPreset] = useState("US");
  const [orderCount, setOrderCount]       = useState(1);

  // required fields always have values; others start unchecked
  const [enabled, setEnabled] = useState({ variant_id: true, quantity: true, price: true });
  const [values,  setValues]  = useState(() => {
    const init = {};
    ALL_FIELDS.forEach((f) => { init[f.key] = f.default; });
    return init;
  });

  const [loading, setLoading]             = useState(false);
  const [progress, setProgress]           = useState(null);
  const [createdOrders, setCreatedOrders] = useState([]);
  const [page, setPage]                   = useState(1);
  const cancelRef = useRef(false);

  const toggle   = (key) => setEnabled((p) => ({ ...p, [key]: !p[key] }));
  const setValue = (key, val) => setValues((p) => ({ ...p, [key]: val }));
  const get      = (key) => (enabled[key] ? values[key] : defaultOf(key));

  // ─── Build Shopify payload ──────────────────────────────────────────────────
  const buildPayload = () => {
    const preset = ADDRESS_PRESETS[addressPreset] ?? ADDRESS_PRESETS.US;
    const phone  = get("phone") || faker.helpers.arrayElement(preset.phones);

    const address = {
      first_name: get("first_name") || faker.person.firstName(),
      last_name:  get("last_name")  || faker.person.lastName(),
      company:    get("company")    || faker.company.name(),
      address1:   preset.address1,
      address2:   preset.address2,
      city:       preset.city,
      province:   preset.province,
      country:    preset.country,
      zip:        preset.zip,
      phone,
    };

    const payload = {
      email:                get("email") || faker.internet.email(),
      phone,
      currency:             get("currency") || preset.currency,
      financial_status:     get("financial_status") || "paid",
      note:                 get("note"),
      tags:                 get("tags"),
      source_name:          get("source_name"),
      send_receipt:         get("send_receipt") === "true",
      taxes_included:       get("taxes_included") === "true",
      tax_exempt:           get("tax_exempt") === "true",
      inventory_behaviour:  get("inventory_behaviour"),
      shipping_address:     address,
      billing_address:      address,
      line_items: [{
        variant_id:        Number(get("variant_id")),
        quantity:          Number(get("quantity")),
        price:             get("price"),
        requires_shipping: get("requires_shipping") === "true",
        taxable:           get("taxable") === "true",
      }],
    };

    // only include transaction block if any txn field is enabled
    const hasTxn = ["txn_gateway","txn_kind","txn_status","txn_amount"].some((k) => enabled[k]);
    if (hasTxn) {
      payload.transactions = [{
        kind:    get("txn_kind")    || "sale",
        gateway: get("txn_gateway") || "bogus",
        status:  get("txn_status")  || "success",
        amount:  get("txn_amount")  || get("price"),
      }];
    }

    // shipping lines
    if (enabled["shipping_title"] || enabled["shipping_price"]) {
      payload.shipping_lines = [{
        title: get("shipping_title") || "Standard Shipping",
        price: get("shipping_price") || "0.00",
        code:  "CUSTOM",
      }];
    }

    const fs = get("fulfillment_status");
    if (enabled["fulfillment_status"] && fs && fs !== "null") {
      payload.fulfillment_status = fs;
    }

    return payload;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    cancelRef.current = false;
    setLoading(true);
    setProgress({ done: 0, total: orderCount });
    setCreatedOrders([]);
    setPage(1);

    let done = 0;
    try {
      for (let i = 0; i < orderCount; i++) {
        if (cancelRef.current) break;
        if (orderCount > 5 && i > 0) await sleep(ORDER_INTERVAL_MS);
        if (cancelRef.current) break;

        let result;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          if (cancelRef.current) break;
          try {
            result = await createOrderApi({ ...buildPayload(), storeUrl, token });
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
          { id: order.id, name: order.name, status: order.financial_status, total: order.total_price, currency: order.currency, createdAt: new Date(order.created_at).toLocaleTimeString() },
          ...prev,
        ]);
        setProgress({ done, total: orderCount });
        addActivity("order", `Custom ${order.name} on ${storeUrl}`);
      }
      showToast(`${done} custom order${done !== 1 ? "s" : ""} created!`, "success");
    } catch (err) {
      console.log(err);
      showToast(err.response?.data?.error ?? "Failed to create order.", "error");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  // ─── Render helpers ──────────────────────────────────────────────────────────
  const inputCls = "bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-purple-500 outline-none rounded-lg py-1.5 px-2.5 text-sm text-gray-800 dark:text-slate-100 transition-colors w-full";

  const renderInput = (field) => {
    if (field.type === "select") {
      return (
        <select value={values[field.key]} onChange={(e) => setValue(field.key, e.target.value)} className={`${inputCls} cursor-pointer`}>
          {field.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
      );
    }
    return (
      <input
        type={field.type === "number" ? "number" : "text"}
        placeholder={field.placeholder ?? ""}
        value={values[field.key]}
        onChange={(e) => setValue(field.key, e.target.value)}
        className={inputCls}
      />
    );
  };

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

      {/* Store credentials */}
      <div className="col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Custom Order</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-0.5 text-sm">
            Check fields to override — unchecked fields use their defaults
          </p>
        </div>

        <form id="custom-order-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Store URL</label>
              <input type="text" placeholder="your-store.myshopify.com" value={storeUrl}
                onChange={(e) => { setStoreUrl(e.target.value); localStorage.setItem("order_storeUrl", e.target.value); }}
                className="w-full bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-purple-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 dark:text-slate-100 transition-colors"
                required />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Access Token</label>
              <input type="text" placeholder="shpat_..." value={token}
                onChange={(e) => { setToken(e.target.value); localStorage.setItem("order_token", e.target.value); }}
                className="w-full bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-purple-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 dark:text-slate-100 transition-colors"
                required />
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">Shipping Address Preset</label>
              <select value={addressPreset} onChange={(e) => setAddressPreset(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-purple-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 dark:text-slate-100 transition-colors cursor-pointer">
                {Object.entries(ADDRESS_PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>{p.label} — {p.address1}, {p.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1.5 text-sm">
                Number of Orders
                <span className="ml-2 font-normal text-gray-400 dark:text-slate-500 text-xs">(&gt;5 paced at 16s)</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" size={16} />
                <input type="number" min={1} max={500} value={orderCount}
                  onChange={(e) => setOrderCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 focus:border-purple-500 outline-none rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-800 dark:text-slate-100 transition-colors" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Field groups */}
      {FIELD_GROUPS.map((group) => (
        <div key={group.label} className="col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
            <p className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">{group.label}</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {group.fields.map((field) => (
              <div key={field.key}>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    id={`chk-${field.key}`}
                    checked={!!enabled[field.key]}
                    onChange={() => !field.required && toggle(field.key)}
                    disabled={field.required}
                    className="w-3.5 h-3.5 accent-purple-600 cursor-pointer disabled:cursor-default"
                  />
                  <label
                    htmlFor={`chk-${field.key}`}
                    className={`text-xs font-medium select-none ${enabled[field.key] ? "text-gray-800 dark:text-slate-100" : "text-gray-400 dark:text-slate-500"} ${!field.required ? "cursor-pointer" : ""}`}
                  >
                    {field.label}
                    {field.required && <span className="ml-1 text-purple-500">*</span>}
                  </label>
                </div>
                {enabled[field.key] && (
                  <div className="pl-5">
                    {renderInput(field)}
                  </div>
                )}
                {!enabled[field.key] && (
                  <p className="pl-5 text-[11px] text-gray-400 dark:text-slate-600">
                    default: <span className="font-mono">{defaultOf(field.key) || "auto"}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Submit bar */}
      <div className="col-span-3 flex gap-3">
        <button type="submit" form="custom-order-form" disabled={loading}
          className={`flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${loading ? "opacity-80 cursor-not-allowed pointer-events-none" : "hover:opacity-90"}`}>
          {loading ? (
            <>
              <Loader2 className="btn-spinner shrink-0" size={20} />
              <span>{progress ? `Creating ${progress.done + 1} of ${progress.total}...` : "Creating..."}</span>
            </>
          ) : (
            <>
              <Sliders size={18} />
              <span>Create {orderCount > 1 ? `${orderCount} Custom Orders` : "Custom Order"}</span>
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

      {/* Progress bar */}
      {loading && progress && (
        <div className="col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-2">
            <span>{progress.done} of {progress.total} orders created</span>
            <span>{Math.round((progress.done / progress.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Created orders table */}
      {createdOrders.length > 0 && (
        <div className="col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100">Created Orders</h3>
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
                  {["#","Order","Status","Total","Time"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((order, idx) => {
                  const globalIdx = (safePage - 1) * PAGE_SIZE + idx;
                  return (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-3 text-xs text-gray-400 dark:text-slate-500">{createdOrders.length - globalIdx}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 dark:text-slate-100">{order.name}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>{order.status}</span>
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
              <p className="text-xs text-gray-400 dark:text-slate-500">Page {safePage} of {totalPages} — {createdOrders.length} total</p>
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

export default CustomOrderForm;
