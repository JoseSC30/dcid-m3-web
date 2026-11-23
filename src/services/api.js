const BASE = import.meta.env.VITE_API_BASE || "/api";
export async function request(path, { method = "GET", body, token } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(BASE + path, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        data.error || data.motivo || `Error HTTP ${response.status}`,
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error("Tiempo de espera agotado");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
export async function downloadTicket(code, token) {
  const r = await fetch(
    `${BASE}/tickets/${encodeURIComponent(code)}/download`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!r.ok) throw new Error("No se pudo descargar el PDF");
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `entrada-${code}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
