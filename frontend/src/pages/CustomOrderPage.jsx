import MainLayout from "../components/layout/MainLayout";
import CustomOrderForm from "../components/orders/CustomOrderForm";

function CustomOrderPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Custom Order</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
          Build an order with full control over every payload field
        </p>
      </div>
      <CustomOrderForm />
    </MainLayout>
  );
}

export default CustomOrderPage;
