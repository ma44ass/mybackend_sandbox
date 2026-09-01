//In this lab, 
// you will manually handle browser Same-Origin Policy checks 
// by implementing OPTIONS preflight responses before allowing actual data mutations.

import * as http from 'http';

const PORT = 4001;
const ALLOWED_ORIGIN = 'http://localhost:3000' // stimulating a frontend origin

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const origin = req.headers['origin'] || 'unknown'; //Read the incoming origin headers
    console.log(`\n[${req.method}] ${req.url} | Request Origin : ${origin}`);

    //1. Intercept Preflight (OPTIONS) Request
    // Browsers automatically send OPTIONS for non-simple requests

    if(req.method === 'OPTIONS'){
        console.log('-> Intercepted OPTIONS Prefilight Request');

        res.writeHead(204, {
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Custom-Header',
            'Access-Control-Max-Age': '86400' // Tells browser to cache preflight for 24 hours
        });

        res.end();
        return;
    }

    //2. Set Access-Control-Allow-Origin header for the actual requests
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Content-Type', 'application/json');

    // 3. Process actual route logic
    if(req.method === 'POST'){
        let body = '';
        req.on('data',chunk => { body += chunk;}); // Listens for incoming byte chunks and appends them to a string.
        req.on('end', () =>{  //Fires once all chunks arrive
            console.log('-> Processing actual POST payload', body);
            res.statusCode = 201;
            res.end(JSON.stringify({
                success : true,
                message : 'Cross-Origin POST request Succeeded',
                payload: body ? JSON.parse(body) : null
            }));
        });
        return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
        success: true,
        message : 'Cross-Origin GET request Succeeded'
    }));
});

server.listen(PORT, () => {
    console.log(`[Step 2 CORS Server] Active at http://localhost:${PORT}`);

});