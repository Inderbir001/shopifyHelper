import MainLayout from "../components/layout/MainLayout";
import OrderForm from "../components/orders/OrderForm";

function Orders() {
  return (
    <MainLayout>

      <div className="mb-10">

        <h1 className="text-5xl font-bold text-gray-800">
          Orders
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          Manage and create Shopify orders
        </p>

      </div>

      <OrderForm />

    </MainLayout>
  );
}

export default Orders;