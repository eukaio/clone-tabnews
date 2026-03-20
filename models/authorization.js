import { InternalServerError } from "infra/errors.js";

const availableFeatures = [
  // User
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:others",

  // Session
  "create:session",
  "read:session",

  // Activation Token
  "read:activation_token",

  // Migration
  "create:migration",
  "read:migration",

  // Status
  "read:status",
  "read:status:all",
];

function can(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);

  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, rawData) {
  validateUser(user);
  validateFeature(feature);
  validaterawData(rawData);

  if (feature === "read:user") {
    return {
      id: rawData.id,
      username: rawData.username,
      features: rawData.features,
      created_at: rawData.created_at,
      updated_at: rawData.updated_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === rawData.id) {
      return {
        id: rawData.id,
        username: rawData.username,
        email: rawData.email,
        features: rawData.features,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === rawData.user_id) {
      return {
        id: rawData.id,
        token: rawData.token,
        user_id: rawData.user_id,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at,
        expires_at: rawData.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: rawData.id,
      user_id: rawData.user_id,
      created_at: rawData.created_at,
      updated_at: rawData.updated_at,
      expires_at: rawData.expires_at,
      used_at: rawData.used_at,
    };
  }

  if (feature === "read:migration") {
    return rawData.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }

  if (feature === "read:status") {
    const output = {
      updated_at: rawData.updated_at,
      dependencies: {
        database: {
          max_connections: rawData.dependencies.database.max_connections,
          opened_connections: rawData.dependencies.database.opened_connections,
        },
      },
    };

    if (can(user, "read:status:all")) {
      output.dependencies.database.version =
        rawData.dependencies.database.version;
    }

    return output;
  }

  return {};
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "É necessário fornecer `user` no model `authorization`.",
    });
  }
}

function validateFeature(feature) {
  if (!feature || !availableFeatures.includes(feature)) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer uma `feature` conhecida no model `authorization`.",
    });
  }
}

function validaterawData(rawData) {
  if (!rawData) {
    throw new InternalServerError({
      cause: "É necessário um `rawData` em `authorization.filterOutput()`.",
    });
  }
}

const authorization = {
  can,
  filterOutput,
  validateUser,
};

export default authorization;
