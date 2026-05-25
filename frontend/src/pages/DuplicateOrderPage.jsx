import MainLayout from "../components/layout/MainLayout";
import DuplicateOrderForm from "../components/orders/DuplicateOrderForm";

function DuplicateOrderPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Duplicate Order</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Re-create an existing order with the same line items and address</p>
      </div>
      <DuplicateOrderForm />
    </MainLayout>
  );
}

export default DuplicateOrderPage;
