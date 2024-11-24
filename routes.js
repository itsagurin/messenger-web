import fs from "fs";
import path from "path";

// Utility for reading files
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("404 Not Found\n");
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", contentType);
        res.end(data);
    });
}

// Object of the routes
const routes = {
    "/": (res) => serveFile(res, "apps/frontend/src/pages/authorization.html", "text/html"),
};

// Universal function for processing static files
function serveStatic(req, res, baseDir) {
    const extname = path.extname(req.url);
    const contentTypes = {
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".ico": "image/x-icon",
    };

    const contentType = contentTypes[extname] || "text/html";
    const filePath = path.join(baseDir, req.url);
    serveFile(res, filePath, contentType);
}

// The main route handler
export function handleRoutes(req, res) {
    const baseDir = "apps/frontend/src/pages";

    // If the route is explicitly specified in the routes object
    if (routes[req.url]) {
        return routes[req.url](res);
    }

    // Processing of static files (CSS, JS, images, etc.)
    if (req.url.startsWith("/css/") || req.url.startsWith("/js/") || req.url.startsWith("/images/")) {
        return serveStatic(req, res, baseDir);
    }

    // If no route is found
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("404 Not Found\n");
}