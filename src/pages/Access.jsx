import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Message from "../components/Message";
export default function Access() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "cliente",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "register") {
        await register(form);
        setMode("login");
        setError("Cuenta creada. Ya puedes iniciar sesión.");
      } else {
        await login(form.correo, form.password);
        navigate("/");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-box">
      <h1>{mode === "login" ? "Iniciar sesión" : "Crear una cuenta"}</h1>
      <p>Accede a la cartelera, gestiona eventos o valida entradas.</p>
      <div className="tabs">
        <button
          className={mode === "login" ? "" : "secondary"}
          onClick={() => setMode("login")}
        >
          Ingresar
        </button>
        <button
          className={mode === "register" ? "" : "secondary"}
          onClick={() => setMode("register")}
        >
          Registrarse
        </button>
      </div>
      <Message text={error} />
      <form onSubmit={submit}>
        {mode === "register" && (
          <>
            <label>
              Nombre completo
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </label>
            <label>
              Rol
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              >
                <option value="cliente">Cliente</option>
                <option value="organizador">Organizador</option>
                <option value="portero">Portero</option>
              </select>
            </label>
          </>
        )}
        <label>
          Correo electrónico
          <input
            type="email"
            required
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button disabled={busy} type="submit">
          {busy
            ? "Procesando…"
            : mode === "login"
              ? "Ingresar"
              : "Crear cuenta"}
        </button>
      </form>
    </section>
  );
}
