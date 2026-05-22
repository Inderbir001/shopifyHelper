import MainLayout from "../../components/layout/MainLayout";
import StoreSetupForm from "../../components/store-setup/StoreSetupForm";
import { importProductsApi } from "../../api/storeSetupApi";

function ImportProductsPage() {
  return (
    <MainLayout>
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-800">Import Products</h1>
        <p className="text-gray-500 mt-3 text-lg">Import products from the default CSV file</p>
      </div>
      <StoreSetupForm
        title="Import Products"
        description="Imports all products from csv/products.csv into the store"
        onRun={(store, token) => importProductsApi(store, token)}
      />
    </MainLayout>
  );
}

export default ImportProductsPage;
