import { createContext, useContext, useMemo, useState } from "react";
import { request } from "../services/api";
const Context = createContext(null);
function readUser() {
  try {
    return JSON.parse(sessionStorage.getItem("ey_user") || "null");
  } catch {
    return null;
  }
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(sessionStorage.getItem("ey_token") || "");
  async function login(correo, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: { correo, password },
    });
    setUser(data.usuario);
    setToken(data.token);
    sessionStorage.setItem("ey_user", JSON.stringify(data.usuario));
    sessionStorage.setItem("ey_token", data.token);
    return data.usuario;
  }
  async function register(payload) {
    return request("/auth/register", { method: "POST", body: payload });
  }
  function logout() {
    setUser(null);
    setToken("");
    sessionStorage.removeItem("ey_user");
    sessionStorage.removeItem("ey_token");
  }
  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
