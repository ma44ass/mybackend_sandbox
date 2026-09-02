import * as http from 'http';
import * as crypto from 'crypto';

const PORT = 4003;

//Simulated backend resouce 
const resourceData = {
    id: 1,
    name: 'Backend MasterClass',
    version : '1.0.2',
    lastUpdated: '2026-09-01T12:00:00Z',
    content: 'This is cached payload data that rarely changes'
}

//Helper function to generate a strong Etag based on resource content
const generateEtag = (data: object): string => {
    const jsonString = JSON.stringify(data);
    return `"${crypto.createHash('md5').update(jsonString).digest('hex')}"`;
};

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
    console.log(`\n[${new Date().toISOString()}] ${req.method} request to ${parsedUrl.pathname}`);

    if(parsedUrl.pathname === '/data'){
        const etag = generateEtag(resourceData);

        // 1. check if the client sent an If-None-Match header
        const clientEtag = req.headers['if-none-match'];

        //2. Conditional request validation
        if (clientEtag === etag){
            console.log(' -> Etag match! Resource is fresh. Returning 304 Not modified');
            res.statusCode = 304; //Not modified
            res.setHeader('ETag', etag);
            res.setHeader('Cache-Control', 'public, max-age=60'); //Cache for 60 seconds
            res.end(); // 304 responses must not contain a response body
            return;
        }

        //3. Cashe miss: Send full resource payload and cache headers
        console.log(' -> Cache miss, Sending full payload and new ETag');
        res.statusCode = 200; //Ok
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.end(JSON.stringify({
            success: true,
            source: 'server-origin',
            data: resourceData
        }));
        return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        error: 'Not Found, Try GET /data'
    }));

    
});

server.listen(PORT, () => {
        console.log(`[Step 4 Caching Server] Active at http://localhost:${PORT}`);
    });

//"607dc6cdbeb3826c7f4b5e7c1bffd840"