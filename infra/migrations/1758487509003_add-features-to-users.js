exports.up = (pgm) => {
  pgm.addColumns("users", {
    features: {
      type: "varchar[]", // Array of strings
      notNull: true,
      default: "{}", // Default to an empty array on postgres
    },
  });
};

exports.down = false;
