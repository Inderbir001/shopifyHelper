import { ShoppingBag, Store, Clock } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";

const icons = {
  order: <ShoppingBag size={16} className="text-purple-500" />,
  store: <Store size={16} className="text-green-500" />,
  default: <Clock size={16} className="text-gray-400" />,
};

const badges = {
  order: "bg-purple-100 text-purple-700",
  store: "bg-green-100 text-green-700",
  default: "bg-gray-100 text-gray-600",
};

function ActivityPanel() {
  const { activities } = useActivity();

  return (
    <div className="w-[300px] min-h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Activity</h3>
        <p className="text-xs text-gray-400 mt-0.5">Clears on refresh</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300">
            <Clock size={32} className="mb-2" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          activities.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-3 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${badges[a.type] ?? badges.default}`}>
                  {icons[a.type] ?? icons.default}
                  {a.type}
                </span>
                <span className="text-xs text-gray-400">{a.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 leading-snug">{a.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityPanel;
