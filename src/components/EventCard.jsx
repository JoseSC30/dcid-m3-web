import { Link } from "react-router-dom";
export default function EventCard({ event }) {
  return (
    <article className="card">
      <div className="event-banner">
        {event.imagen ? <img src={event.imagen} alt="" /> : <span>🎫</span>}
      </div>
      <div className="card-body">
        <span className="eyebrow">{event.estado}</span>
        <h3>{event.nombre}</h3>
        <p>
          {event.lugar} · {new Date(event.fecha).toLocaleString("es-BO")}
        </p>
        <p>{event.descripcion}</p>
        <div className="between">
          <small>{event.sectores?.length || 0} sectores</small>
          <Link className="button" to={`/eventos/${event.id}`}>
            Ver evento
          </Link>
        </div>
      </div>
    </article>
  );
}
