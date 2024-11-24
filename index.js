import http from "http";
import { handleRoutes } from "./routes.js";

const hostname = "127.0.0.1";
const port = 2000;

const server = http.createServer((req, res) => {
    handleRoutes(req, res);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
