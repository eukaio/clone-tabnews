import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

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
};

export default user;
