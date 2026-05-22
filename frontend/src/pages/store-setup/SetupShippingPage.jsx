import MainLayout from "../../components/layout/MainLayout";
import StoreSetupForm from "../../components/store-setup/StoreSetupForm";
import { setupShippingApi } from "../../api/storeSetupApi";

function SetupShippingPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Setup Shipping</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Create US Warehouse location + DOM and INTL shipping zones</p>
      </div>
      <StoreSetupForm
        title="Setup Shipping"
        description="Creates US Warehouse location and configures delivery profile zones"
        onRun={(store, token) => setupShippingApi(store, token)}
      />
    </MainLayout>
  );
}

export default SetupShippingPage;
