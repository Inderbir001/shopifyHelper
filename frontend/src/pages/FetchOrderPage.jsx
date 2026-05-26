import MainLayout from "../components/layout/MainLayout";
import FetchOrderForm from "../components/orders/FetchOrderForm";

function FetchOrderPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Fetch Order</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
          Look up any order by ID or order name and view the full JSON
        </p>
      </div>
      <FetchOrderForm />
    </MainLayout>
  );
}

export default FetchOrderPage;
