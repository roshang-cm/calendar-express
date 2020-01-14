const db = require("./db_handler");
const queries = require("./queries");
const bcrypt = require("bcrypt-nodejs");
module.exports = {
  signUp: (req, res) => {
    let { username, password_hash } = req.body;
    password_hash = bcrypt.hashSync(password_hash);
    if (!username || !password_hash) {
      res.status(400).send({ message: "Credentials not provided" });
    }
    let isUserPresent = false;
    db.query(queries.getUsersQuery, (err, result) => {
      result.forEach(entry => {
        if (entry.username === username) {
          isUserPresent = true;
        }
      });
      if (isUserPresent) {
        res.status(400).send({
          message: "User already exists"
        });
      } else {
        db.query(
          queries.insertUserQueryBuilder(username, password_hash),
          (err, result) => {
            if (err) res.status(400).send(err);
            else
              db.query(queries.getUsersQuery, (err, result) => {
                let user = null;
                result.forEach(entry => {
                  if (entry.username == username) {
                    user = entry;
                  }
                });
                if (user) {
                  res.send(user);
                }
              });
          }
        );
      }
    });
  },
  login: (req, res) => {
    let { username, password_hash } = req.query;
    db.query(queries.getUsersQuery, (err, result) => {
      let user = null;
      result.forEach(entry => {
        if (entry.username == username) {
          user = entry;
        }
      });
      if (user) {
        if (bcrypt.compareSync(password_hash, user.password_hash)) {
          res.send(user);
        } else {
          res.status(400).send({
            message: "Invalid Password"
          });
        }
      } else {
        res.status(404).send({
          message: "User does not exist"
        });
      }
    });
  },
  getAllEvents: (req, res) => {
    db.query(queries.getAllEventsQuery, (err, result) => {
      if (err) res.status(400).send(err);
      else res.send(result);
    });
  },
  getAllUsers: (req, res) => {
    db.query(queries.getUsersQuery, (err, result) => {
      if (err) res.status(400).send(err);
      else res.send(result);
    });
  },
  getEvents: (req, res) => {
    let { user_id } = req.query;
    db.query(queries.getEventsForUserQueryBuilder(user_id), (err, result) => {
      if (err) res.status(404).send(err);
      else res.send(result);
    });
  },
  insertEvents: (req, res) => {
    let { date, title, description, user_id, completed } = req.body;
    console.log(req.body);
    db.query(
      queries.insertEventQueryBuilder(
        date,
        description,
        title,
        user_id,
        completed == "false" || !completed ? false : true
      ),
      (err, result) => {
        if (err) console.log(err);
        else res.send(result);
      }
    );
  },
  updateEvent: (req, res) => {
    let { event_id, date, title, description, completed } = req.body;
    db.query(
      queries.updateEventQueryBuilder(
        event_id,
        date,
        title,
        description,
        completed == "false" || !completed ? false : true
      ),
      (err, result) => {
        console.log(err, result);
        if (err) res.status(400).send(err);
        else res.send(result);
      }
    );
  },
  deleteEvent: (req, res) => {
    let { event_id } = req.body;
    db.query(queries.deleteEventQueryBuilder(event_id), (err, result) => {
      if (err) res.status(400).send(err);
      else res.send(result);
    });
  }
};
