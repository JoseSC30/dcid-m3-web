import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Catalog from "./pages/Catalog";
import EventDetail from "./pages/EventDetail";
import Access from "./pages/Access";
import MyOrders from "./pages/MyOrders";
import MyTickets from "./pages/MyTickets";
import Organizer from "./pages/Organizer";
import Checkin from "./pages/Checkin";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Catalog />} />
            <Route path="eventos/:id" element={<EventDetail />} />
            <Route path="acceso" element={<Access />} />
            <Route element={<ProtectedRoute roles={["cliente"]} />}>
              <Route path="compras" element={<MyOrders />} />
              <Route path="entradas" element={<MyTickets />} />
            </Route>
            <Route element={<ProtectedRoute roles={["organizador"]} />}>
              <Route path="organizador" element={<Organizer />} />
            </Route>
            <Route element={<ProtectedRoute roles={["portero"]} />}>
              <Route path="portero" element={<Checkin />} />
            </Route>
            <Route path="*" element={<Catalog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
