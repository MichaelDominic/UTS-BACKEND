const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password, options = {}) {
  const { page_number, page_size, sort } = options;
  const user = await authenticationRepository.getUserByEmail(email, {
    page_number,
    page_size,
    sort,
  });

  if (!user.data.length) {
    // no found email
    return null;
  }
  const firstUser = user.data[0];

  if (
    firstUser.login_attempts >= 5 &&
    Date.now() - firstUser.last_attempt < 1800000
  ) {
    throw errorResponder(
      errorTypes.INVALID_CREDENTIALS,
      'Too many failed login attempts'
    );
  }

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    //Will the counter if login succes
    await authenticationRepository.updateUserLoginAttempts(
      email,
      0,
      Date.now()
    );

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  } else {
    await authenticationRepository.updateUserLoginAttempts(
      email,
      user.login_attempts + 1,
      Date.now()
    );
  }

  return null;
}

module.exports = {
  checkLoginCredentials,
};
