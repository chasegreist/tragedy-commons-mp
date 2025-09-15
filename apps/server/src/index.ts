import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import http from 'http';
import { GameRoom } from './rooms/GameRoom';

const port = Number(process.env.PORT || 2567);
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health' || req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }
  res.writeHead(404);
  res.end();
});

const gameServer = new Server({
  transport: new WebSocketTransport({ server }),
});

gameServer.define('game', GameRoom);

server.listen(port, () => {
  console.log(`Colyseus listening on ws://localhost:${port}`);
});
