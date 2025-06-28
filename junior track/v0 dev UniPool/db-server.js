"use client";

// This script runs a simple HTTP server to serve the database management tool
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    let filePath;
    let contentType;

    // Map URLs to file paths
    switch(req.url) {
        case '/':
        case '/index.html':
            filePath = path.join(__dirname, 'db-management.html');
            contentType = 'text/html';
            break;
        case '/services/AuthService.js':
            // Serve the AuthService as a module
            filePath = path.join(__dirname, 'services', 'AuthService.ts');
            contentType = 'application/javascript';
            // Add export to make it work as a module
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end(`Error loading AuthService.js: ${err}`);
                    return;
                }
                // Convert TypeScript to JavaScript (basic)
                const jsModule = `
                    ${data.replace(/\.ts/g, '.js')}
                    export { AuthService };
                `;
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(jsModule);
            });
            return;
        default:
            // Serve other files normally
            filePath = path.join(__dirname, req.url);
            const ext = path.extname(filePath).toLowerCase();
            
            switch(ext) {
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                default:
                    contentType = 'text/plain';
            }
    }

    // Serve the file
    if (req.url !== '/services/AuthService.js') {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end(`File not found: ${req.url}`);
                } else {
                    res.writeHead(500);
                    res.end(`Server error: ${err.code}`);
                }
                return;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}/ to manage the database`);
});
