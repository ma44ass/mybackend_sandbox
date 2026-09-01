import * as http from 'http';


const PORT = 4000;
const IDEMPOTENT_METHODS = new Set(['GET','HEAD', 'PUT', 'DELETE', 'OPTIONS']);

const server = http.createServer((req : http.IncomingMessage, res: http.ServerResponse) => {
    console.log('\n============');
    console.log(`[REQUEST LINE] ${req.method} ${req.url} HTTP/${req.httpVersion}`);
    console.log('\n============');

    //1. Inspect rew headers sent by the client
    console.log('\n--- HEADERS ---');
    for(const [key,value] of Object.entries(req.headers)){
        console.log(`${key}: ${value}`);
    }

    //2. Evaluate idempotency on HTTP method specification
    const method = (req.method || 'GET').toUpperCase();
    const isIdempotent = IDEMPOTENT_METHODS.has(method);

    console.log(`\n--- METHOD ANALYSIS ---`);
    console.log(`Method : ${method}`);
    console.log(`Idempotent: ${isIdempotent}`);


    //3. Assemble stream data chunks into a buffer
    const bodyChunks: Buffer[] = [];

    req.on('data', (chunk : Buffer) => {
        bodyChunks.push(chunk);
    });

    req.on('end',() => {
        const rawBody = Buffer.concat(bodyChunks).toString();

        console.log('\n--- Body ---');
        console.log(rawBody ? rawBody : '[No payload sent]');

        //Construct raw HTTP response headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Idemotent-Method', isIdempotent ? 'true' : 'false');
        res.setHeader('X-Server-Engine', 'Raw-NodeJs-Http');
        res.statusCode = 200

        const responsePayload = {
            status: 'success',
            protocol: `HTTP/${req.httpVersion}`,
            method: method,
            path: req.url,
            isIdempotent: isIdempotent,
            receivedHeaderCount: Object.keys(req.headers).length,
            parseBody: rawBody ? JSON.parse(rawBody) : null
        };

        res.end(JSON.stringify(responsePayload))
    });
});



server.listen(PORT, () => {
    console.log(`[Step 1 Protocol Server] Active at hhtp://localhost:${PORT}`);
});