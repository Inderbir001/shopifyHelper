import { Trash2 } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";

function Navbar() {
  const { clearActivities } = useActivity();

  return (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10">
      <div className="flex items-center gap-5">
        <h2 className="text-3xl font-bold text-gray-800">
          Shopify Admin Panel
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={clearActivities}
          title="Clear activity log"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition-all text-sm font-medium"
        >
          <Trash2 size={16} />
          Clear Activity
        </button>
      </div>
    </div>
  );
}

export default Navbar;
