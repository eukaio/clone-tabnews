import bcryptjs from "bcryptjs";
require("dotenv").config();

async function hash(password) {
  const rounds = getNumberOfRounds();
  const passwordWithPepper = addPepper(password);
  return await bcryptjs.hash(passwordWithPepper, rounds);
}

function addPepper(password) {
  const pepper = process.env.PEPPER || "";
  return password + pepper;
}

function getNumberOfRounds() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }
  return rounds;
}

async function compare(providedPassword, storedPassword) {
  const passwordWithPepper = addPepper(providedPassword);
  return await bcryptjs.compare(passwordWithPepper, storedPassword);
}

const password = {
  hash,
  compare,
};
export default password;
