import MainLayout from "../../components/layout/MainLayout";
import StoreSetupForm from "../../components/store-setup/StoreSetupForm";
import { setupMarketsApi } from "../../api/storeSetupApi";

function SetupMarketsPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Setup Markets</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Configure Domestic and International markets</p>
      </div>
      <StoreSetupForm
        title="Setup Markets"
        description="Resets markets to Domestic (US) + International"
        onRun={(store, token) => setupMarketsApi(store, token)}
      />
    </MainLayout>
  );
}

export default SetupMarketsPage;
