import { useEffect, useState } from "react";
import { request } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Message from "../components/Message";
export default function Organizer() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    fecha: "",
    lugar: "",
    imagen: "",
    descripcion: "",
  });
  const [sector, setSector] = useState({
    eventId: "",
    nombre: "General",
    precio: "50",
    cupo_total: "100",
  });
  const [message, setMessage] = useState("");
  const [sales, setSales] = useState({});
  async function load() {
    try {
      const results = await Promise.all(
        ["borrador", "publicado", "cancelado"].map((estado) =>
          request(`/events?estado=${estado}`),
        ),
      );
      setEvents(
        results
          .flat()
          .filter((e) => String(e.organizer_id) === String(user.id)),
      );
    } catch (e) {
      setMessage(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [token]);
  async function create(e) {
    e.preventDefault();
    try {
      const d = await request("/events", { method: "POST", token, body: form });
      setSector((s) => ({ ...s, eventId: String(d.id) }));
      setMessage(
        `Evento ${d.id} creado. Agrega un sector antes de publicarlo.`,
      );
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function addSector(e) {
    e.preventDefault();
    try {
      await request(`/events/${sector.eventId}/sectors`, {
        method: "POST",
        token,
        body: {
          nombre: sector.nombre,
          precio: Number(sector.precio),
          cupo_total: Number(sector.cupo_total),
        },
      });
      setMessage("Sector añadido");
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function change(id, estado) {
    try {
      await request(`/events/${id}`, {
        method: "PATCH",
        token,
        body: { estado },
      });
      setMessage(`Evento ${id}: ${estado}`);
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function getSales(id) {
    try {
      const d = await request(`/events/${id}/sales`, { token });
      setSales((s) => ({ ...s, [id]: d }));
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <>
      <h1>Panel del organizador</h1>
      <Message text={message} />
      <div className="columns">
        <section className="panel">
          <h2>Crear evento</h2>
          <form onSubmit={create}>
            {[
              ["nombre", "Nombre"],
              ["fecha", "Fecha"],
              ["lugar", "Lugar"],
              ["imagen", "URL de imagen"],
              ["descripcion", "Descripción"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                <input
                  required={["nombre", "fecha", "lugar"].includes(k)}
                  type={k === "fecha" ? "datetime-local" : "text"}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
            <button>Guardar borrador</button>
          </form>
        </section>
        <section className="panel">
          <h2>Agregar sector</h2>
          <form onSubmit={addSector}>
            <label>
              Evento
              <select
                required
                value={sector.eventId}
                onChange={(e) =>
                  setSector({ ...sector, eventId: e.target.value })
                }
              >
                <option value="">Seleccionar evento</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} (#{e.id})
                  </option>
                ))}
              </select>
            </label>
            {[
              ["nombre", "Nombre"],
              ["precio", "Precio (Bs)"],
              ["cupo_total", "Cupo total"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                <input
                  required
                  type={k === "nombre" ? "text" : "number"}
                  min={k === "nombre" ? undefined : 0}
                  step={k === "precio" ? "0.01" : "1"}
                  value={sector[k]}
                  onChange={(e) =>
                    setSector({ ...sector, [k]: e.target.value })
                  }
                />
              </label>
            ))}
            <button>Añadir sector</button>
          </form>
        </section>
      </div>
      <h2>Mis eventos</h2>
      {events.map((e) => (
        <article className="row-card" key={e.id}>
          <div>
            <strong>{e.nombre}</strong>{" "}
            <span className={`status ${e.estado}`}>{e.estado}</span>
            <p>
              {e.lugar} · {e.sectores.length} sectores
            </p>
            {e.sectores.map((s) => (
              <small key={s.id}>
                {s.nombre}: Bs {s.precio} · {s.cupos_disponibles} cupos |{" "}
              </small>
            ))}
            {sales[e.id] && (
              <p>
                Reservas: {sales[e.id].entradas} · Ingresos estimados: Bs{" "}
                {sales[e.id].ingresos}
              </p>
            )}
          </div>
          <div className="actions">
            {e.estado === "borrador" && (
              <button onClick={() => change(e.id, "publicado")}>
                Publicar
              </button>
            )}
            {e.estado === "publicado" && (
              <button
                className="secondary"
                onClick={() => change(e.id, "cancelado")}
              >
                Cancelar
              </button>
            )}
            <button className="secondary" onClick={() => getSales(e.id)}>
              Ver ventas
            </button>
          </div>
        </article>
      ))}
      {!events.length && <p>No tienes eventos todavía.</p>}
    </>
  );
}
