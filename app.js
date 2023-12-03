const { WebSocket, WebSocketServer } = require("ws");

function heartbeat() {
  this.isAlive = true;
}

const wss = new WebSocketServer({ port: 8081 });

wss.on("connection", function connection(ws) {
  ws.isAlive = true;

  ws.on("error", console.error);

  ws.on("pong", heartbeat);

  ws.on("message", function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", function close() {
  clearInterval(interval);
});

module.exports = wss;
