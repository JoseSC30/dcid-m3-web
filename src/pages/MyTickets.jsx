import { useEffect, useState } from "react";
import { request, downloadTicket } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Message from "../components/Message";
export default function MyTickets() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    request("/tickets/mine", { token })
      .then(setTickets)
      .catch((e) => setMessage(e.message));
  }, [token]);
  return (
    <>
      <h1>Mis entradas</h1>
      <p>Descarga el PDF de cada entrada. Cada código QR es único.</p>
      <Message text={message} />
      <div className="cards">
        {tickets.map((t) => (
          <article className="panel" key={t.code}>
            <span className="eyebrow">Entrada digital</span>
            <h2>{t.event_name}</h2>
            <p>Sector: {t.sector_name}</p>
            <code>{t.code}</code>
            <p>
              <button
                onClick={() =>
                  downloadTicket(t.code, token).catch((e) =>
                    setMessage(e.message),
                  )
                }
              >
                Descargar PDF
              </button>
            </p>
          </article>
        ))}
      </div>
      {!tickets.length && <p>Todavía no tienes entradas emitidas.</p>}
    </>
  );
}
