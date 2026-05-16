import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  return (
    <div className="flex bg-[#F5F7FB]">

      <Sidebar />

      <div className="flex-1 min-h-screen">

        <Navbar />

        <div className="p-10">
          {children}
        </div>

      </div>

    </div>
  );
}

export default MainLayout;