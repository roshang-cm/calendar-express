const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const app = express();
var bodyParser = require("body-parser");
const port = 4000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello World!"));
app.post("/signup", routes.signUp);
app.get("/login", routes.login);
app.get("/events", routes.getEvents);
app.post("/events", routes.insertEvents);
app.post("/all-events", routes.getAllEvents);
app.post("/all-users", routes.getAllUsers);
app.post("/update-event", routes.updateEvent);
app.post("/delete-event", routes.deleteEvent);

app.listen(port, () => console.log(`Listening on port ${port}!`));
