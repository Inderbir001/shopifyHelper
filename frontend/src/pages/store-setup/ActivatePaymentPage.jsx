import MainLayout from "../../components/layout/MainLayout";
import StoreSetupForm from "../../components/store-setup/StoreSetupForm";
import { activatePaymentApi } from "../../api/storeSetupApi";

function ActivatePaymentPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Activate Payment</h1>
        <p className="text-gray-500 mt-1 text-sm">Activate third-party payment provider via browser automation</p>
      </div>
      <StoreSetupForm
        title="Activate Payment"
        description="Opens browser and activates payment provider (provider ID 24)"
        onRun={(store) => activatePaymentApi(store)}
      />
    </MainLayout>
  );
}

export default ActivatePaymentPage;
