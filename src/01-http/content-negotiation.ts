import * as http from 'http';

const PORT  =4004;

const resourceData = {
    id: 42,
    name : 'Assma',
    role : 'Web dev student',
    skills : ['Node.js','TypeScript', 'PostgreSQL', 'System Architecture']
};

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
    console.log(`\n[${new Date().toISOString()} ${req.method} resquest to ${parsedUrl}]`);

    if(parsedUrl.pathname === "/profile"){
        const acceptHeader = req.headers['accept'] || '*/*';
        const acceptLanguage = req.headers['accept-language'] || 'en';

        console.log(`-> Client Accept header: ${acceptHeader}`);
        console.log(`-> Client Accept-Language: ${acceptLanguage}`);

        //CRITICAL CACHING TIP: Inform shared caches that the response 
        //varies depending on the Accept and Accept-Language headers.
        res.setHeader('Vary', 'Accept, Accept-Language');

        //Determine language preference
        const isFrench = acceptLanguage.includes('fr');
        const greeting = isFrench ? 'Bonjour' : 'Hello';
        const languageCode = isFrench ? 'fr' : 'en';

        //Handle HTML Representation
        if( acceptHeader.includes('text/html')){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=ytf-8');
            res.setHeader('Content-Language', languageCode);

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="${languageCode}">
                <head><meta charset="UTF-8"><title>Profile</title></head>
                <body style="font-family: sans-serif; padding: 2rem;">
                    <h1>${greeting}, ${resourceData.name}!</h1>
                    <p><strong>Role:</strong> ${resourceData.role}</p>
                    <p><strong>Skills:</strong> ${resourceData.skills.join(', ')}</p>
                </body>
                </html>
            `;
            res.end(htmlContent);
            return;
        }

        //Handle XML representation
        if( acceptHeader.includes('text/html')){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=ytf-8');
            res.setHeader('Content-Language', languageCode);

            const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
                <profile>
                    <greeting>${greeting}</greeting>
                    <id>${resourceData.id}</id>
                    <name>${resourceData.name}</name>
                    <role>${resourceData.role}</role>
                    <skills>${resourceData.skills.join(', ')}</skills>
                </profile>
            `;
            res.end(xmlContent);
            return;
        };

        //Default fallback representation : JSON
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json; charset=utf-8');
        res.setHeader('Content-Language', languageCode);

        res.end(JSON.stringify({
            success: true,
            greeting,data: resourceData
        }));
        return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        error: 'Not Found. Try GET /profile'
    }));
});

server.listen(PORT, () => {
    console.log(`[Content Negotiation Server] Active at http://localhost:${PORT}`);
})