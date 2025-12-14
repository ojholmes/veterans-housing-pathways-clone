const WebSocket = require('ws');

let wss = null;

function initWebSocketServer(server) {
  if (wss) return wss;
  // Accepts an HTTP server (express app.listen returns http.Server)
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.send(JSON.stringify({ type: 'welcome', timestamp: Date.now() }));
  });
  return wss;
}

function broadcast(obj) {
  if (!wss) return;
  const msg = JSON.stringify(obj);
  wss.clients.forEach(c => {
    try { c.send(msg) } catch (e) { /* ignore */ }
  });
}

module.exports = { initWebSocketServer, broadcast };
