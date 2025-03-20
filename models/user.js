import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM   
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado.",
        action: "Informe um nome de usuário diferente.",
      });
    }
    return results.rows[0];
  }
}

async function create(userInputValues) {
  await validadeUniqueEmail(userInputValues.email);
  await validadeUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validadeUniqueEmail(email) {
    const results = await database.query({
      text: `
        SELECT 
          email
        FROM   
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O Email informado já está em uso.",
        action: "Informe um email diferente.",
      });
    }
  }

  async function validadeUniqueUsername(username) {
    const results = await database.query({
      text: `
        SELECT 
          username
        FROM   
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
      values: [username],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O nome de usuário informado já está em uso.",
        action: "Informe um nome de usuário diferente.",
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING 
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
