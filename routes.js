const db = require("./db_handler");
const queries = require("./queries");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const config = require("./config");

//Helpers
/**
 * Returns user object if JWT provided in the request is valid.
 * @param {req} Request
 */
const resolveJwtToUser = req =>
  new Promise(async (resolve, reject) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }
    if (!token) {
      reject("JWT Auth not provided");
    }
    let user_id;
    try {
      user_id = jwt.verify(token, config.jwtSecret).id;
      console.log("result of jwt", jwt.verify(token, config.jwtSecret));
    } catch (error) {
      reject("Auth invalid");
    }
    let user = await db
      .query(queries.getUserWhere("id", user_id))
      .catch(err => reject(err));
    resolve(user.rows[0]);
  });

//Route Handlers
module.exports = {
  signUp: async (req, res) => {
    try {
      //Getting credentials
      let { username, password } = req.body;
      console.log(username, password);
      if (!username || !password) {
        res.status(400).send("Proper credentials not provided");
        return;
      }
      let password_hash = bcrypt.hashSync(password);
      //Assigning default role as Employee
      let roles = (
        await db.query("SELECT * FROM roles WHERE role_name = 'employee';")
      ).rows;
      let role_id = roles[0].role_id;
      let userInsertResult = await db.query(
        queries.insertUser(username, password_hash, role_id)
      );
      //Once user is inserted, getting the data using the id
      let userId = userInsertResult.rows[0].id;
      let userSelectResult = await db.query(queries.getUserWhere("id", userId));
      let user = userSelectResult.rows[0];
      delete user.password_hash;
      jwtString = jwt.sign({ id: user.id }, config.jwtSecret, {
        expiresIn: "24h"
      });
      res.send({ ...user, jwt: jwtString });
    } catch (e) {
      res.status(400).send(e);
    }
  },
  login: async (req, res) => {
    try {
      let { username, password } = req.query;
      console.log(username, password);
      if (!username || !password) {
        res.status(400).send("Credentials missing");
        return;
      }
      let user = await db.query(
        queries.getUserWhere("username", `'${username}'`)
      );
      if (user.rowCount == 0) {
        res.status(404).send("User does not exist");
        return;
      }
      user = user.rows[0];
      if (bcrypt.compareSync(password, user.password_hash)) {
        delete user.password_hash;
        jwtString = jwt.sign({ id: user.id }, config.jwtSecret, {
          expiresIn: "24h"
        });
        res.send({ ...user, jwt: jwtString });
      } else {
        res.status(400).send("Invalid Password");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getAllEvents: (req, res) => {
    db.query(queries.getAllEvents, (err, result) => {
      if (err) res.status(400).send(err);
      else res.send(result.rows);
    });
  },
  getAllUsers: (req, res) => {
    db.query(queries.getAllUsers, (err, result) => {
      if (err) res.status(400).send(err);
      else res.send(result.rows);
    });
  },
  getEvents: (req, res) => {
    let { user_id } = req.query;
    db.query(queries.getEventsForUser(user_id), (err, result) => {
      if (err) res.status(404).send(err);
      else res.send(result.rows);
    });
  },
  insertEvents: async (req, res) => {
    let { date, title, description, completed } = req.body;
    if (!(date && title)) {
      res.status(400).json({
        success: false,
        message: "Missing event details"
      });
      return;
    }
    let user = {};
    try {
      user = await resolveJwtToUser(req);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err
      });
      return;
    }

    //If user has permission to write
    if (user.write) {
      let insertResult = await db
        .query(queries.insertEvent(date, title, description, completed))
        .catch(err => {
          console.error(err);
          res.status(400).json({
            success: false,
            message: err
          });
          return;
        });
      res.json({
        success: true,
        message: "Event added successfully"
      });
      return;
    }

    res.status(440).json({
      success: false,
      message: "User does not have permission to add events"
    });
  },
  updateEvent: async (req, res) => {
    let { date, title, event_id, description, completed } = req.body;
    if (!(event_id && date && title)) {
      res.status(400).json({
        success: false,
        message: "Missing event details"
      });
      return;
    }
    let user = await resolveJwtToUser(req).catch(err => {
      res.status(400).json({
        success: false,
        message: err
      });
      return;
    });
    //If user has permission to write
    if (user.write) {
      let updateResult = await db
        .query(
          queries.updateEvent(event_id, date, title, description, completed)
        )
        .catch(err => {
          console.log(err);
          res.status(400).json({
            success: false,
            message: err
          });
          return;
        });
      if (updateResult.rowCount == 0) {
        res.status(400).json({
          success: false,
          message: "No event with id " + event_id
        });
        return;
      }
      res.json({
        success: true,
        message: "Event updated successfully"
      });
      return;
    }
    res.status(440).json({
      success: false,
      message: "User does not have permission to add events"
    });
  },
  deleteEvent: async (req, res) => {
    let { event_id } = req.body;
    if (!event_id) {
      res.status(400).json({
        success: false,
        message: "Event ID not provided"
      });
      return;
    }
    let user = await resolveJwtToUser(req).catch(err => {
      res.status(400).json({
        success: false,
        message: err
      });
    });
    if (user.delete) {
      let deleteResult = await db.query(queries.deleteEvent(event_id));
      if (deleteResult.rowCount == 0) {
        res.status(400).json({
          success: false,
          message: "No event with id " + event_id
        });
        return;
      }
      res.json({
        success: true,
        message: "Event deleted successfully"
      });
    } else {
      res.status(403).json({
        success: false,
        message: "User does not have permission to delete events"
      });
    }
  },
  updateUserRole: async (req, res) => {
    let { user_id, role_id } = req.body;
    if (!(user_id && role_id)) {
      res.status(400).json({
        success: false,
        message: "Details not provided."
      });
      return;
    }
    let user = await resolveJwtToUser(req).catch(err => {
      res.status(400).json({
        success: false,
        message: err
      });
      return;
    });

    if (user.write && user.read && user.delete) {
      let updateResult = await db
        .query(queries.updateUserRole(user_id, role_id))
        .catch(err => {
          res.status(400).json({
            success: false,
            message: err
          });
        });
      res.json({
        success: true,
        message: "User role updated successfully"
      });
      return;
    }
    res.status(403).json({
      success: false,
      message: "User does not have permission to update roles"
    });
  }
};
