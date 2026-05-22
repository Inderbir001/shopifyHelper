import MainLayout from "../components/layout/MainLayout";
import OrderForm from "../components/orders/OrderForm";

function Orders() {
  return (
    <MainLayout>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Orders</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Manage and create Shopify orders</p>
      </div>

      <OrderForm />

    </MainLayout>
  );
}

export default Orders;