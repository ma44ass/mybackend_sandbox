// run this to generate a huge-dataset :Create a 50MB dummy file for testing

//node -e "const fs = require('fs'); const file = fs.createWriteStream('huge-dataset.txt'); for(let i=0; i<1000000; i++) file.write('Line ' + i + ': Streaming large data payloads efficiently using Node.js buffers and pipes.\n'); file.end();"



import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const PORT = 4007;
const filePath = path.join(__dirname, 'huge-dataset.txt');

const server = http.createServer((req: http.IncomingMessage, res:http.ServerResponse) => {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
    console.log(`\n[${new Date().toISOString()} Request for large file: ${parsedUrl.pathname}]`);

    if(parsedUrl.pathname === '/download'){
        //check if file exists first
        if(!fs.existsSync(filePath)){
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: 'Run the file generator first!'
            }));
            return;
        }

        //Get file stats to set Content-Length for progress tracking
        const stat = fs.statSync(filePath);
        console.log(`-> Streaming file of size : ${(stat.size / (1024 *1024)).toFixed(2)} MB`);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Length', stat.size) // Tells the client how big the download is
        res.setHeader('Content-Disposition', 'attachment; filename="huge-dataset.txt"');

        // THE STREAMING MAGIC:
        // Create a readable stream from the disk and pipe it directly to the response socket.
        // Node handles backpressure automatically, if the network is slow, it pauses reading from disk.
        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', (err) => {
            console.error('Stream error:', err);
            res.statusCode = 500;
            res.end('Internal Server Error during file stream');
        });

        //Pipe connects the readable disk stream directly to the writable HTTP response socket
        fileStream.pipe(res);
        return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not Found. Try GET /download' }));
});


server.listen(PORT, () => {
    console.log(`[Large Data Transfer Server] Active at http://localhost:${PORT}`);
});