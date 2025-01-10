const saltRounds = 10;
const bcrypt = require('bcrypt');

exports.generatePassword = async (password) => {
  const passwordHash = await bcrypt.hash(password, saltRounds);
  return passwordHash;
};

exports.checkPassword = async (password, passwordHash) => {
  const isPasswordMatch = await bcrypt.compare(password, passwordHash);
  return isPasswordMatch;
};