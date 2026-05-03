export function getSessionId(): string {
  let id = localStorage.getItem("physique_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("physique_session_id", id);
  }
  return id;
}

export function sessionHeaders(): HeadersInit {
  return { "X-Session-Id": getSessionId() };
}
