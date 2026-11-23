import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { request } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Message from "../components/Message";
export default function EventDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [event, setEvent] = useState(null);
  const [sector, setSector] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [method, setMethod] = useState("CARD");
  const [last4, setLast4] = useState("1111");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  async function load() {
    try {
      const e = await request("/events/" + id);
      setEvent(e);
      setSector((s) => s || String(e.sectores?.[0]?.id || ""));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [id]);
  async function buy(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const data = await request("/orders", {
        method: "POST",
        token,
        body: {
          evento_id: Number(id),
          sector_id: Number(sector),
          cantidad: Number(cantidad),
          payment_method: method,
          card_last4: last4,
        },
      });
      setResult(data);
      await load();
    } catch (e) {
      setError(
        e.message + (e.data?.order_id ? ` · Orden ${e.data.order_id}` : ""),
      );
    } finally {
      setBusy(false);
    }
  }
  if (!event) return <Message text={error || "Cargando evento…"} />;
  const selected = event.sectores.find((s) => String(s.id) === sector);
  return (
    <>
      <Link to="/">← Volver a cartelera</Link>
      <section className="detail">
        <span className="eyebrow">{event.estado}</span>
        <h1>{event.nombre}</h1>
        <p>{event.descripcion}</p>
        <div className="detail-meta">
          <span>📍 {event.lugar}</span>
          <span>📅 {new Date(event.fecha).toLocaleString("es-BO")}</span>
        </div>
      </section>
      <div className="columns">
        <section className="panel">
          <h2>Sectores disponibles</h2>
          {event.sectores.map((s) => (
            <div className="sector" key={s.id}>
              <div>
                <strong>{s.nombre}</strong>
                <p>
                  {s.cupos_disponibles} de {s.cupo_total} disponibles
                </p>
              </div>
              <strong>Bs {s.precio}</strong>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Comprar entradas</h2>
          <Message text={error} type="error" />
          {result && (
            <Message
              text={`Orden ${result.id}: ${result.estado}. ${result.warning || ""}`}
            />
          )}{" "}
          {!user ? (
            <p>
              <Link to="/acceso">Inicia sesión</Link> como cliente para comprar.
            </p>
          ) : user.rol !== "cliente" ? (
            <p>Solo los clientes pueden comprar entradas.</p>
          ) : (
            <form onSubmit={buy}>
              <label>
                Sector
                <select
                  required
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                >
                  {event.sectores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} — Bs {s.precio}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Cantidad (máximo 6)
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                />
              </label>
              <label>
                Método de pago
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {["CARD", "QR", "BANK_TRANSFER", "WALLET"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              {method === "CARD" && (
                <label>
                  Últimos cuatro dígitos de prueba
                  <input
                    maxLength="4"
                    pattern="[0-9]{4}"
                    value={last4}
                    onChange={(e) => setLast4(e.target.value)}
                  />
                  <small>0000 simula rechazo; 1111 simula aprobación.</small>
                </label>
              )}
              <div className="total">
                Total estimado:{" "}
                <strong>
                  Bs{" "}
                  {(
                    Number(selected?.precio || 0) * Number(cantidad || 0)
                  ).toFixed(2)}
                </strong>
              </div>
              <button
                disabled={
                  busy ||
                  !selected ||
                  selected.cupos_disponibles < Number(cantidad)
                }
              >
                {busy ? "Procesando…" : "Confirmar compra"}
              </button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
