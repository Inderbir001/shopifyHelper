import { useState } from "react";
import { createOrderApi } from "../../api/orderApi";
import { buildOrderPayload } from "../../utils/orderPayload";

function OrderForm() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const orderData = buildOrderPayload({
        email,
        title,
        quantity,
        price,
      });

      const response = await createOrderApi(orderData);

      console.log(response);

      alert("Order created successfully");
    } catch (error) {
      console.log(error);

      alert("Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Order</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>

          <input
            type="email"
            placeholder="Customer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Title</label>

          <input
            type="text"
            placeholder="Product Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Quantity</label>

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Price</label>

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          {loading ? "Creating..." : "Create Order"}
        </button>
      </form>
    </div>
  );
}

export default OrderForm;
