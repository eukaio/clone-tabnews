import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { NotFoundError } from "infra/errors.js";
import user from "models/user.js";
import authorization from "models/authorization.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneById(tokenId) {
  const results = await database.query({
    text: `
      SELECT 
        *
      FROM   
        user_activation_tokens
      WHERE
        id = $1
      LIMIT
        1
      ;`,
    values: [tokenId],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O token de ativação utilizado não foi encontrado no sistema.",
      action: "Certifique-se de que o link utilizado está correto.",
    });
  }

  return results.rows[0];
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "eukaio <contato@mail.eukaio.com.br>",
    to: user.email,
    subject: "Ative seu cadastro!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro:

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe eukaio.com.br`,
  });
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', NOW()),
          updated_at = timezone('utc', NOW())
        WHERE
          id = $1
          AND expires_at > timezone('utc', NOW())
          AND used_at IS NULL
        RETURNING
          *
      ;`,
      values: [activationTokenId],
    });

    if (results.rowCount === 1) {
      return results.rows[0];
    }

    const currentToken = await findOneById(activationTokenId);

    if (currentToken.used_at !== null) {
      return currentToken;
    }

    throw new NotFoundError({
      message: "O token de ativação utilizado expirou.",
      action: "Faça um novo cadastro.",
    });
  }
}

async function activateUserByUserId(user_id) {
  const userToActivate = await user.findOneById(user_id);

  if (authorization.can(userToActivate, "read:activation_token")) {
    const activatedUser = await user.setFeatures(user_id, [
      "create:session",
      "read:session",
      "update:user",
    ]);

    return activatedUser;
  }

  return userToActivate;
}

const activation = {
  sendEmailToUser,
  create,
  findOneById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
