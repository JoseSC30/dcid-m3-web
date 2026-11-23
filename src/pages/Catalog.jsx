import { useEffect, useState } from "react";
import { request } from "../services/api";
import EventCard from "../components/EventCard";
import Message from "../components/Message";
export default function Catalog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    request("/events")
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Cartelera</span>
        <h1>Vive el próximo evento</h1>
        <p>Explora eventos, selecciona tu sector y consigue tus entradas.</p>
      </section>
      <Message text={error} type="error" />
      {loading ? (
        <p>Cargando eventos…</p>
      ) : events.length ? (
        <div className="cards">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="empty">
          Aún no hay eventos publicados. Inicia sesión como organizador para
          crear uno.
        </div>
      )}
    </>
  );
}
