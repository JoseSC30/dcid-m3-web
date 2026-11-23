import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export default function Layout() {
  const { user, logout } = useAuth();
  const links = [
    ["/", "Cartelera"],
    ...(user?.rol === "cliente"
      ? [
          ["/compras", "Mis compras"],
          ["/entradas", "Mis entradas"],
        ]
      : []),
    ...(user?.rol === "organizador" ? [["/organizador", "Organizador"]] : []),
    ...(user?.rol === "portero" ? [["/portero", "Control de ingreso"]] : []),
  ];
  return (
    <>
      <header className="top">
        <div className="shell header">
          <NavLink to="/" className="brand">
            🎟 EntradasYa
          </NavLink>
          <nav>
            {links.map(([to, name]) => (
              <NavLink end={to === "/"} key={to} to={to}>
                {name}
              </NavLink>
            ))}
          </nav>
          <div className="account">
            {user ? (
              <>
                <small>
                  {user.nombre} · {user.rol}
                </small>
                <button className="secondary" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <NavLink to="/acceso">Acceder</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="shell">
        <Outlet />
      </main>
      <footer className="shell footer">
        EntradasYa · Grupo Stack Overflow
      </footer>
    </>
  );
}
