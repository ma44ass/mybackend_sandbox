import * as http from 'http';

const PORT = 4006;
let requestCount = 0;

const server = http.createServer((req:http.IncomingMessage, res: http.ServerResponse) => {
    requestCount++;
    const reqId = requestCount;

    //Inspect the underlying socket to see connection reuse
    const socket = req.socket;
    const clientPort = socket.remotePort;

    console.log(`\n[Request #${reqId} Incoming from ${req.method} ${req.url}]`);
    console.log(`-> Connection Header from client: ${req.headers['connection'] || 'none'}`);
    console.log(`-> Reusing TCP socket on client port: ${clientPort}`);

    //Set response headers to instruct the client to keep the connection active
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Connection','keep-alive');
    res.setHeader('Keep-Alive', 'timeout=5, max=100'); // 5 second idle timeout

    res.end(JSON.stringify({
        success: true,
        requestId: reqId,
        message : 'Request processed over persistent TCP connection',
        clientPort
    }));
});

//Hook into native TCP socket events to watch the connection lifecycle
server.on('connection', (socket) => {
    console.log(`\n[TCP Event] new TCP handshake completed. Socket opened for client port: ${socket.remotePort}`);

    socket.on('close', () => {
        console.log(`[TCP Event] TCP connection closed/timed out for client port: ${socket.remotePort}`)
    });
});


server.listen(PORT, () => {
    console.log(`[Keep-Alive Server] Active at http://localhost:${PORT}`);
});