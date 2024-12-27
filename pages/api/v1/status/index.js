import database from "infra/database";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const databaseVersion = await database.query("SHOW server_version;");
    const databaseMaxConnections = await database.query(
      "SHOW max_connections;",
    );
    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnections = await database.query({
      text: "SELECT COUNT(*)::int AS opened_connections FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const webserverVersion = parseFloat(process.version.substring(1));

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: parseInt(databaseVersion.rows[0].server_version),
          max_connections: parseInt(
            databaseMaxConnections.rows[0].max_connections,
          ),
          opened_connections:
            databaseOpenedConnections.rows[0].opened_connections,
        },
        webserver: {
          version: webserverVersion,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Erro dentro do catch do controller:");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;
