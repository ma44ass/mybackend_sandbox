import * as http from 'http';
import * as zlib from 'zlib';

const PORT = 4005;

// A deliberately large payload
const largeResource = {
    title: 'Backend  Masterclass Dataset',
    description: 'This is a simulated payload designed to show how compression shrinks data over the wire.',
    records: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        item: `Item detail record number ${i + 1} containing extra descriptive text to increase payload weight.`
    }))
};

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
    console.log(`\n[${new Date().toISOString()}] ${req.method} request to ${parsedUrl.pathname}`);

    if (parsedUrl.pathname === '/heavy-data') {
        const acceptEncoding = req.headers['accept-encoding'] || '';
        console.log(`-> Client Accept-Encoding header: ${acceptEncoding}`);

        const jsonString = JSON.stringify(largeResource);
        const rawBuffer = Buffer.from(jsonString, 'utf-8');

        // Always inform caches that the response changes based on Accept-Encoding
        res.setHeader('Vary', 'Accept-Encoding');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        // Check if the client supports gzip compression
        if (typeof acceptEncoding === 'string' && acceptEncoding.includes('gzip')) {
            console.log('-> Client supports gzip. Compressing payload...');

            zlib.gzip(rawBuffer, (err, compressedBuffer) => {
                if (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Internal Server Error during compression' }));
                    return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Encoding', 'gzip');
                res.setHeader('Content-Length', compressedBuffer.length);
                
                console.log(`-> Compressed payload size: ${compressedBuffer.length} bytes (Original: ${rawBuffer.length} bytes)`);
                res.end(compressedBuffer);
            });
            return;
        }

        // Fallback: Send uncompressed data if client doesn't support gzip
        console.log('-> Client does not support gzip. Sending raw uncompressed payload.');
        res.statusCode = 200;
        res.setHeader('Content-Length', rawBuffer.length);
        res.end(rawBuffer);
        return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not Found. Try GET /heavy-data' }));
});

server.listen(PORT, () => {
    console.log(`[HTTP Compression Server] Active at http://localhost:${PORT}`);
});