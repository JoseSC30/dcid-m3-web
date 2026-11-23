import { useEffect, useRef, useState } from "react";
import { request } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Message from "../components/Message";
export default function Checkin() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [total, setTotal] = useState(null);
  const [scanning, setScanning] = useState(false);
  const reader = useRef(null);
  useEffect(() => {
    request("/events")
      .then(setEvents)
      .catch(() => {});
    return () => {
      reader.current?.stop().catch(() => {});
      reader.current = null;
    };
  }, []);
  async function validate(value = code) {
    setResult(null);
    try {
      const data = await request("/checkin", {
        method: "POST",
        token,
        body: { code: value, event_id: Number(eventId) },
      });
      setResult({ ok: true, message: "INGRESO PERMITIDO", data });
      await count();
    } catch (e) {
      setResult({
        ok: false,
        message: e.data?.motivo || e.message,
        first: e.data?.primer_ingreso,
      });
    }
  }
  async function count() {
    if (!eventId) return;
    try {
      const d = await request(`/checkin/count/${eventId}`, { token });
      setTotal(d.total);
    } catch (e) {
      setResult({ ok: false, message: e.message });
    }
  }
  async function startScan() {
    if (!eventId) {
      setResult({ ok: false, message: "Selecciona el evento" });
      return;
    }
    if (reader.current) {
      await reader.current.stop().catch(() => {});
      reader.current = null;
      setScanning(false);
      return;
    }
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      reader.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decoded) => {
          await scanner.stop().catch(() => {});
          reader.current = null;
          setScanning(false);
          setCode(decoded);
          await validate(decoded);
        },
        () => {},
      );
      setScanning(true);
    } catch (e) {
      reader.current = null;
      setScanning(false);
      setResult({ ok: false, message: e.message });
    }
  }
  return (
    <>
      <h1>Control de ingreso</h1>
      <p>
        Selecciona el evento y escanea el QR o introduce el código manualmente.
      </p>
      <section className="panel checkin">
        <label>
          Evento
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setTotal(null);
            }}
          >
            <option value="">Seleccionar evento</option>
            {events.map((e) => (
              <option value={e.id} key={e.id}>
                {e.nombre} (#{e.id})
              </option>
            ))}
          </select>
        </label>
        <label>
          Código de entrada
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código UUID"
          />
        </label>
        <div className="actions">
          <button disabled={!eventId || !code} onClick={() => validate()}>
            Validar ingreso
          </button>
          <button className="secondary" onClick={startScan}>
            {scanning ? "Detener cámara" : "Escanear QR"}
          </button>
          <button className="secondary" disabled={!eventId} onClick={count}>
            Contar ingresos
          </button>
        </div>
        <div id="qr-reader" className="scanner" />
        {result && (
          <div className={`result ${result.ok ? "allowed" : "denied"}`}>
            <strong>{result.message}</strong>
            {result.first && (
              <p>
                Primer ingreso: {new Date(result.first).toLocaleString("es-BO")}
              </p>
            )}
          </div>
        )}
        {total !== null && <Message text={`Ingresos registrados: ${total}`} />}
      </section>
    </>
  );
}
