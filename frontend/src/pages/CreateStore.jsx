// frontend/src/pages/CreateStore.jsx

import MainLayout from "../components/layout/MainLayout";
import CreateStoreForm from "../components/stores/CreateStoreForm";

function CreateStore() {
  return (
    <MainLayout>
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-800">Create Store</h1>

        <p className="text-gray-500 mt-3 text-lg">
          Create Shopify development stores and import products automatically
        </p>
      </div>

      <CreateStoreForm />
    </MainLayout>
  );
}

export default CreateStore;
