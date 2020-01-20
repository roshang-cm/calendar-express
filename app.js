const config = require("./config");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const app = express();
const bodyParser = require("body-parser");
const port = config.port;

//Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Routes
app.get("/", (req, res) => res.send("It works"));
app.post("/signup", routes.signUp);
app.get("/login", routes.login);
app.get("/events", routes.getEvents);
app.post("/events", routes.insertEvents);
app.post("/all-events", routes.getAllEvents);
app.post("/all-users", routes.getAllUsers);
app.post("/all-roles", routes.getAllRoles);
app.post("/update-event", routes.updateEvent);
app.post("/delete-event", routes.deleteEvent);
app.post("/update-role", routes.updateUserRole);
//Listening
app.listen(port, () => console.log(`Listening on port ${port}!`));
