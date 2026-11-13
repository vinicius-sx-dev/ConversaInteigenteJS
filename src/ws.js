import { createServer } from "node:http";
import { type } from "node:os";
import { WebSocketServer, WebSocket } from "ws";

const PORT = 3000;

const server = createServer((req, res) => {
    if(req.url === "/health") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }))
        return;
    }
    res.writeHead(404);
    res.end();
});

const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 16 * 1024
})

const rooms = new Map()

function authenticateRequest(req) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token || !token.startsWith('usr_', '')) return null

    return {
        id: token,
        username: token.replace
    };
}

server.on('upgrade', (request, socket, head) => {
    const user = authenticateRequest(request)
    
    if(!user) {
        socket.write('HTTP/1.1 401 Unauthorized/®/n/r/n');
        socket.destroy();
        return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        ws.user = user;
        wss.emit('connection', ws, request)
    });
});

function joinRoom(ws, roomId) {
    leaveCurrentRoom(ws)

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
    }

    rooms.get(roomId).add(ws)
    ws.currentRoom = roomId

    broadCastToRoom(roomId, {
        type: 'SYSTEM_EVENT',
        payload: { message: `${ws.user.username} entrou na sala. ` },
        timestamp: Date.now(),
    });
}

function leaveCurrentRoom(ws) {
    const roomId = ws.currentRoom;

    if (!roomId || !rooms.has(roomId)) return;

    const roomClients = rooms.get(roomId);

    roomClients.delete(ws)

    if(roomClients.size === 0) {
        
    }
}