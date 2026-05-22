import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Store,
  Globe,
  Truck,
  Package,
  CreditCard,
  Clock,
  Activity,
  ArrowRight,
  Inbox,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { useActivity } from "../context/ActivityContext";

const quickActions = [
  {
    label: "Create Order",
    description: "Place a new Shopify order",
    path: "/orders",
    icon: ShoppingBag,
    color: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
  },
  {
    label: "Create Store",
    description: "Spin up a dev store automatically",
    path: "/create-store",
    icon: Store,
    color: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100",
  },
  {
    label: "Setup Markets",
    description: "Configure Domestic + International",
    path: "/store-setup/markets",
    icon: Globe,
    color: "bg-sky-50 text-sky-600",
    border: "border-sky-100",
  },
  {
    label: "Setup Shipping",
    description: "US Warehouse + delivery zones",
    path: "/store-setup/shipping",
    icon: Truck,
    color: "bg-teal-50 text-teal-600",
    border: "border-teal-100",
  },
  {
    label: "Import Products",
    description: "Import from CSV with inventory",
    path: "/store-setup/products",
    icon: Package,
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    label: "Activate Payment",
    description: "Enable third-party payment provider",
    path: "/store-setup/payment",
    icon: CreditCard,
    color: "bg-pink-50 text-pink-600",
    border: "border-pink-100",
  },
];

const TYPE_STYLES = {
  order: "bg-violet-100 text-violet-600",
  store: "bg-indigo-100 text-indigo-600",
};

const TYPE_ICONS = {
  order: ShoppingBag,
  store: Store,
};

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { activities } = useActivity();

  const orderCount = activities.filter((a) => a.type === "order").length;
  const storeCount = activities.filter((a) => a.type === "store").length;

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Overview of your Shopify Helper activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Orders Created"
          value={orderCount}
          icon={ShoppingBag}
          accent="bg-violet-100 text-violet-600"
        />
        <StatCard
          label="Stores Created"
          value={storeCount}
          icon={Store}
          accent="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Total Actions"
          value={activities.length}
          icon={Activity}
          accent="bg-gray-100 text-gray-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="col-span-2">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`bg-white border ${action.border} rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                    <p className="text-xs text-gray-400 truncate">{action.description}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Recent Activity</h2>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Inbox size={32} className="mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-0.5">Actions will appear here</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-[340px] overflow-y-auto">
                {activities.map((a) => {
                  const Icon = TYPE_ICONS[a.type] ?? Activity;
                  const style = TYPE_STYLES[a.type] ?? "bg-gray-100 text-gray-500";
                  return (
                    <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style}`}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-snug">{a.message}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {a.timestamp}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
