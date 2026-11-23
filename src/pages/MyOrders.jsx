import { useEffect, useState } from "react";
import { request } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Message from "../components/Message";
export default function MyOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  async function load() {
    try {
      setOrders(await request("/orders", { token }));
    } catch (e) {
      setMessage(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [token]);
  async function recover(id) {
    try {
      await request(`/orders/${id}/reissue`, { method: "POST", token });
      setMessage("Entradas generadas. Ve a Mis entradas.");
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <>
      <h1>Mis compras</h1>
      <Message text={message} />
      {orders.length ? (
        orders.map((o) => (
          <article className="row-card" key={o.id}>
            <div>
              <strong>{o.id}</strong>
              <p>
                {o.cantidad} entradas · Bs {o.monto}
              </p>
              <small>{new Date(o.created_at).toLocaleString("es-BO")}</small>
            </div>
            <div>
              <span className={`status ${o.estado}`}>{o.estado}</span>
              {o.estado === "pagada" && (
                <button className="secondary" onClick={() => recover(o.id)}>
                  Recuperar entradas
                </button>
              )}
            </div>
          </article>
        ))
      ) : (
        <p>Aún no tienes compras.</p>
      )}
    </>
  );
}
