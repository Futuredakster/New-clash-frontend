const isLocal = window.location.hostname === "localhost";
export const link = isLocal ? "http://localhost:3001" : "https://clash-backend-production.up.railway.app";
