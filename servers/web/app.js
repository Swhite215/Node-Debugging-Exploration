const config = require("./config");
const express = require("express");
const playersClient = require("./lib/playersClient")(config.players);
const path = require("path");
const session = require("./session");
const requestLogger = require("../shared/lib/requestLogger");
const expressRequestID = require("express-request-id")();

const app = express();

app.set("x-powered-by", false);
app.use(expressRequestID);

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

// Specify node_modules location if not set from environment variables.
if (!("NODE_PATH" in process.env)) {
    process.env.NODE_PATH = path.resolve(__dirname, "../../node_modules");
}

app.use(express.static(path.join(__dirname, "public")));
app.use(
    "/bootstrap/css",
    express.static(path.join(process.env.NODE_PATH, "/bootstrap/dist/css"))
);
app.use(
    "/bootstrap/js",
    express.static(path.join(process.env.NODE_PATH, "/bootstrap/dist/js"))
);
app.use(
    "/jquery/js",
    express.static(path.join(process.env.NODE_PATH, "/jquery/dist"))
);
app.use(
    "/popper/js",
    express.static(path.join(process.env.NODE_PATH, "/popper.js/dist/umd"))
);

app.use(session);

app.use(async (request, response, next) => {
    if (request.session.playerId) {
        return next();
    }
    const result = await playersClient.create(request.id);
    request.session.playerId = result.body.id;
    return next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Custom Request Logging Middleware
// app.use((request, response, next) => {
//     console.log(new Date().toISOString(), request.method, request.originalUrl);
//     return next();
// });

//Morgan Request Logging Middleware
app.use(requestLogger);

app.use(require("./router"));

//Express Error Page
app.use((request, response) => {
    console.warn(
        new Date().toISOString(),
        request.method,
        request.originalUrl,
        "404"
    );
    return response.status(404).render("404", {
        title: "404"
    });
});

//Error Handling Middleware
app.use((error, request, response) => {
    if (response.headersSent) {
        return next(error);
    }

    console.error(error);
    return response.status(500).render("500", {
        title: "500"
    });
});

module.exports = app;
