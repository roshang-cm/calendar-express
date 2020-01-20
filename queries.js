const deleteRolesTable = `
DROP TABLE IF EXISTS roles CASCADE;`;
const deletePermissionsTable = `
DROP TABLE IF EXISTS permissions CASCADE;`;
const deleteUsersTable = `
DROP TABLE IF EXISTS users CASCADE;`;
const deleteEventsTable = `
DROP TABLE IF EXISTS events CASCADE;`;
const createRolesTable = `
CREATE TABLE IF NOT EXISTS roles (
  role_id serial PRIMARY KEY,
  role_name VARCHAR (50) UNIQUE NOT NULL
);`;
const createPermissionsTable = `
CREATE TABLE IF NOT EXISTS permissions (
  role_id INTEGER NOT NULL REFERENCES roles, 
  read BOOLEAN NOT NULL,
  write BOOLEAN NOT NULL,
  delete BOOLEAN NOT NULL
);`;
const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username VARCHAR (50) UNIQUE NOT NULL, 
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles
  );`;
const createEventsTable = `CREATE TABLE IF NOT EXISTS events ( 
  id serial PRIMARY KEY,
   date TIMESTAMP NOT NULL,
    title TEXT NOT NULL,
     description TEXT NOT NULL,
       completed BOOLEAN);`;

const getAllUsers =
  "SELECT users.id, users.username, users.role_id, roles.role_name, permissions.read, permissions.write, permissions.delete FROM users, roles, permissions WHERE users.role_id = roles.role_id AND permissions.role_id = roles.role_id;";
const getAllEvents = `SELECT * FROM events;`;
const getAllRoles = `SELECT * FROM roles`;
const getUserWhere = (key, value) =>
  `SELECT users.id, users.username, users.password_hash, users.role_id, roles.role_name, permissions.read, permissions.write, permissions.delete FROM users, roles, permissions WHERE users.${key} = ${value} AND users.role_id = roles.role_id AND permissions.role_id = roles.role_id;`;

const deleteEvent = event_id => {
  return `DELETE FROM events WHERE id = '${event_id}'`;
};
const insertRole = role_name => {
  return `INSERT INTO roles (role_name) VALUES ('${role_name}') RETURNING role_id;`;
};
const insertPermission = (role_id, canRead, canWrite, canDelete) => {
  return `
  INSERT INTO permissions (role_id, read, write, delete) VALUES (${role_id}, ${canRead}, ${canWrite}, ${canDelete});`;
};
const insertUser = (username, password_hash, role_id) => {
  return `INSERT INTO users (username, password_hash, role_id) VALUES ('${username}', '${password_hash}', ${role_id}) RETURNING id;`;
};
const insertEvent = (date, title, description, completed) => {
  return `
    INSERT INTO events
    (
        date,
        title,
        description,
        completed
    ) VALUES (
'${date}',
'${title}',
'${description}',
${completed ? true : false}
    );
    `;
};
const getEventsForUser = user_id => {
  return `SELECT * FROM events WHERE user_id = ${user_id};`;
};

const updateEvent = (event_id, date, title, description, completed) => {
  return `
  UPDATE events 
  SET date = '${date}',
  title = '${title}',
  description = '${description}',
  completed = ${completed ? true : false}
  WHERE id = ${event_id}
  `;
};

const updateUserRole = (user_id, role_id) => {
  return `
  UPDATE users
  SET role_id = ${role_id}
  WHERE id = ${user_id}
  `;
};

const updatePermission = (permission_id, canRead, canWrite, canDelete) => {
  return `
  UPDATE permissions 
  SET read = ${canRead}, 
  write = ${canWrite}, 
  delete = ${canDelete}
  WHERE role_id = ${permission_id}
  `;
};

module.exports = {
  deleteEventsTable,
  deleteRolesTable,
  deletePermissionsTable,
  deleteUsersTable,
  createRolesTable,
  createPermissionsTable,
  createUsersTable,
  createEventsTable,
  insertRole,
  insertPermission,
  insertEvent,
  insertUser,
  getAllUsers,
  getAllRoles,
  getUserWhere,
  getAllEvents,
  getEventsForUser,
  updateEvent,
  deleteEvent,
  updateUserRole,
  updatePermission
};
