import { Bell, Menu } from "lucide-react";

function Navbar() {
  return (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10">
      <div className="flex items-center gap-5">
        <h2 className="text-3xl font-bold text-gray-800 ">
          Shopify Admin Panel
        </h2>
      </div>

      <div className="flex items-center gap-6"></div>
    </div>
  );
}

export default Navbar;
