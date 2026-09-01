import * as http from 'http';

const PORT  = 4002;

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    //Use the native URL class to safely parse pathname and query parameters
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    console.log(`\n[${new Date().toISOString()}] ${req.method} resuest to ${pathname}`);

    //Default content-type for all responses
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Server-Engine', 'Raw-NOdeJs-Http');

    //Routing switchboard based on pathname
    switch(pathname){
        case '/success':
            res.statusCode = 200; //OK
            res.end(JSON.stringify({
                status: 200,
                message: 'OK: Request proccessed successfully.'
            }));
            break;
    
        case '/created':
            res.statusCode = 201; //created
            res.setHeader('Location', '/api/resources/42');
            res.end(JSON.stringify({
                status: 201,
                message: 'Created: New Resource generated', resourceId: 42
            }));
            break;       
        
        case '/old-route':
            res.statusCode = 301; //Moved Permanently
            res.setHeader('Location', '/new-route');
            res.end(JSON.stringify({
                status: 301,
                message: 'Moved Permanently: Please update your client routes'
            }));
            break;
            
        case '/new-route':
            res.statusCode = 200; //OK
            res.end(JSON.stringify({
                status: 200,
                message: 'Welcome to the new permanent route endpoint!'
            }));
            break;

        case '/private':
            const authHeader = req.headers['authorization'];
            if(!authHeader){
                res.statusCode = 401; //Unauthorized
                res.end(JSON.stringify({
                    status : 401,
                    message: 'Unauthorized : Missing Authorization headers '
                }))
            } else {
                res.statusCode = 200; //OK
                res.end(JSON.stringify({
                    status : 200,
                    message : 'Access granted. Welcome inside the secure zone!'
                }));
            }
            break;
        
        case '/crash':
            res.statusCode = 500; // Internal Server Error
            res.end(JSON.stringify({
                status: 500,
                error: 'Internal Server Error: Unexpected esception caught.'
            }));
            break;
        
        default:
            res.statusCode = 404;
            res.end(JSON.stringify({
                status: 404,
                error: 'Not Found: The requested endpoint does not exist.'
            }));
            break;
};


});

server.listen(PORT, () => {
    console.log(`[Step 3 Status Controller] Active at hhtp://localhost:${PORT}`);
});