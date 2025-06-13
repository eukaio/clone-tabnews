exports.up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // Why 96 in length? Same as tabnews.
    token: {
      type: "varchar(96)",
      notNull: true,
      unique: true,
    },

    // Do I need foreign key here? Maybe not. https://www.shayon.dev/post/2023/355/do-you-really-need-foreign-keys/
    user_id: {
      type: "uuid",
      notNull: true,
    },

    // Why timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz
    expires_at: {
      type: "timestamptz",
      notNull: true,
    },

    created_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },

    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
  });
};

exports.down = false;
