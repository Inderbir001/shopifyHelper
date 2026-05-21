import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ActivityPanel from "./ActivityPanel";

function MainLayout({ children }) {
  return (
    <div className="flex bg-[#F5F7FB]">

      <Sidebar />

      <div className="flex-1 min-h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-1">
          <div className="flex-1 p-10">
            {children}
          </div>

          <ActivityPanel />
        </div>
      </div>

    </div>
  );
}

export default MainLayout;
