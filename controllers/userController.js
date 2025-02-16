const User = require('../models/User');

// Если требуется страница профиля, можно добавить GET /users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.render('profile', { user, message: null, error: null });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
};

// POST /users/profile/update — обновление профиля
exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.id, { username, email }, { new: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Profile update failed.');
  }
};
