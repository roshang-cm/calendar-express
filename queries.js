let createUsersTableQuery =
  "CREATE TABLE IF NOT EXISTS user ( id INT AUTO_INCREMENT PRIMARY KEY, username TEXT NOT NULL, password_hash TEXT NOT NULL);";
let createEventsTableQuery =
  "CREATE TABLE IF NOT EXISTS events ( id INT AUTO_INCREMENT PRIMARY KEY, date DATETIME NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, user_id int, completed BOOLEAN, FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE);";
let insertUserQueryBuilder = (username, password_hash) => {
  return `INSERT INTO user(username, password_hash) VALUES ('${username}', '${password_hash}');`;
};
let getUsersQuery = "SELECT * FROM user;";
let insertEventQueryBuilder = (
  date,
  title,
  description,
  user_id,
  completed
) => {
  return `
    INSERT INTO events
    (
        date,
        title,
        description,
        user_id,
        completed
    ) VALUES (
'${date}',
'${title}',
'${description}',
${user_id},
${completed ? 1 : 0}
    );
    `;
};
let getEventsForUserQueryBuilder = user_id => {
  return `SELECT * FROM events WHERE user_id = ${user_id};`;
};

let getAllEventsQuery = `SELECT * FROM events;`;
let updateEventQueryBuilder = (
  event_id,
  date,
  title,
  description,
  completed
) => {
  return `UPDATE events SET date = '${date}', title = '${title}', description = '${description}', completed = ${
    completed ? 1 : 0
  } WHERE id = ${event_id}`;
};

let deleteEventQueryBuilder = event_id => {
  return `DELETE FROM events WHERE id = '${event_id}'`;
};
module.exports = {
  createUsersTableQuery,
  createEventsTableQuery,
  insertEventQueryBuilder,
  insertUserQueryBuilder,
  getUsersQuery,
  getAllEventsQuery,
  getEventsForUserQueryBuilder,
  updateEventQueryBuilder,
  deleteEventQueryBuilder
};
