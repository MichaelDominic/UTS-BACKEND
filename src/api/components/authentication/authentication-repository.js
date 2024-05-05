const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @param {object} options - Options
 * @returns {Promise}
 */
async function getUserByEmail(email, options = {}) {
  const { page_number = 1, page_size = 10, sort = 'email:asc' } = options;
  const skip = (page_number - 1) * page_size;

  const [sortField, sortOrder] = sort.split(':');
  const sortCriteria = {};
  sortCriteria[sortField] = sortOrder === 'desc' ? -1 : 1;

  const query = User.find({ email })
    .sort(sortCriteria)
    .skip(skip)
    .limit(page_size);

  const total_count = await User.countDocuments({ email });

  return {
    data: await query,
    page_number,
    page_size,
    count: query.length,
    total_pages: Math.ceil(total_count / page_size),
    has_previous_page: page_number > 1,
    has_next_page: skip + query.length < total_count,
  };
}

/**
 *  ( soal nomor 2)
 * @param {string} email - Email
 * @param {number} attempts - Total login yang gagal
 * @param {number} lastAttempt - Login terakhir
 * @returns {Promise}
 */
async function updateUserLoginAttempts(email, attempts, lastAttempt) {
  await User.findOneAndUpdate(
    { email },
    { $set: { login_attempts: attempts, last_attempt: lastAttempt } }
  );
}

/**
 * (soal nomor 3) Buat user baru
 * @param {object} userData
 * @returns {Promise}
 */
async function createUser(userData) {
  return await User.create(userData);
}

/**
 * Get user menggunakan ID
 * @param {string} userId -
 * @returns {Promise}
 */
async function getUserById(userId) {
  return await User.findById(userId);
}

/**
 * Update user
 * @param {string} userId
 * @param {object} userData
 * @returns {Promise}
 */
async function updateUserById(userId, userData) {
  return await User.findByIdAndUpdate(userId, userData, { new: true });
}

/**
 * Delete user
 * @param {string} userId -
 * @returns {Promise}
 */

async function deleteUserById(userId) {
  return await User.findByIdAndDelete(userId);
}

module.exports = {
  getUserByEmail,
  updateUserLoginAttempts,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
