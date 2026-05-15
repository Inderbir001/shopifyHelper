import { useEffect } from "react";
import api from "./api/axios";

function App() {
  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    try {
      const response = await api.get("/");
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1>Shopify Helper</h1>
    </div>
  );
}

export default App;
