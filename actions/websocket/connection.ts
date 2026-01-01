import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    // Optionally handle incoming messages from clients
  });
});

export function broadcast(event: string, data: any) {
  const payload = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}