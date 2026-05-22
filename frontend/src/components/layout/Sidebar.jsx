import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  Store,
  ChevronRight,
  ChevronDown,
  Wrench,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const storeSetupItems = [
  { name: "Setup Markets", path: "/store-setup/markets" },
  { name: "Setup Shipping", path: "/store-setup/shipping" },
  { name: "Import Products", path: "/store-setup/products" },
  { name: "Activate Payment", path: "/store-setup/payment" },
];

function Sidebar() {
  const location = useLocation();

  const [storeSetupOpen, setStoreSetupOpen] = useState(
    location.pathname.startsWith("/store-setup/")
  );

  useEffect(() => {
    if (location.pathname.startsWith("/store-setup/")) {
      setStoreSetupOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: <ShoppingBag size={20} />,
    },
    {
      name: "Create Store",
      path: "/create-store",
      icon: <Store size={20} />,
    },
  ];

  const bottomMenuItems = [
    {
      name: "Products",
      path: "/products",
      icon: <Package size={20} />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  const isStoreSetupActive = location.pathname.startsWith("/store-setup/");

  return (
    <div className="w-[280px] min-h-screen bg-[#060B27] text-white flex flex-col justify-between">
      <div>
        <div className="px-8 py-8">
          <h1 className="text-4xl font-bold leading-tight">
            Shopify
            <br />
            <span className="text-purple-500">Helper</span>
          </h1>
        </div>

        <nav className="px-4 flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200
              ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-purple-600 to-purple-500"
                  : "hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className="text-lg">{item.name}</span>
            </Link>
          ))}

          {/* Store Setup collapsible section */}
          <div>
            <button
              onClick={() => setStoreSetupOpen((prev) => !prev)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left ${
                isStoreSetupActive || storeSetupOpen ? "bg-white/10" : "hover:bg-white/10"
              }`}
            >
              <Wrench size={20} />
              <span className="text-lg flex-1">Store Setup</span>
              {storeSetupOpen ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>

            {storeSetupOpen && (
              <div className="mt-1 flex flex-col gap-1 pl-4">
                {storeSetupItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 pl-10 pr-4 py-3 rounded-2xl transition-all duration-200 text-base ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                        : "hover:bg-white/10 text-gray-400"
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {bottomMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200
              ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-purple-600 to-purple-500"
                  : "hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className="text-lg">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold">version 1.0.0 </h3>
              <p className="text-sm text-gray-400">
                by Inderbir Singh https://github.com/Inderbir001
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
