const pg = require("pg");
const queries = require("./queries");
const postgresConnection = new pg.Client({
  host: "localhost",
  database: "calendar",
  user: "dbuser",
  password: "root",
  port: 5432
});

async function createRoleWithPermissions(
  role_name,
  canRead,
  canWrite,
  canDelete
) {
  let result = await postgresConnection.query(queries.insertRole(role_name));
  return await postgresConnection.query(
    queries.insertPermission(
      result.rows[0].role_id,
      canRead,
      canWrite,
      canDelete
    )
  );
}
async function initDatabase() {
  try {
    await postgresConnection.query(queries.createRolesTable);
    await postgresConnection.query(queries.createPermissionsTable);
    await postgresConnection.query(queries.createUsersTable);
    await postgresConnection.query(queries.createEventsTable);
    // await createRoleWithPermissions("admin", true, true, true);
    // await createRoleWithPermissions("manager", true, true, false);
    // await createRoleWithPermissions("employee", true, false, false);
  } catch (e) {
    console.error(e);
    console.clear();
  }
}
postgresConnection.connect(error => {
  if (error) console.error("PostgreSQL failed to connect, error: ", error);
  else console.log("Connected to PostgreSQL");
});
initDatabase();
module.exports = postgresConnection;
