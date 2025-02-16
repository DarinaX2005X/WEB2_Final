const Joi = require('joi');
const User = require('../models/User');

const updateProfileSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required()
});

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { username, email }, { new: true }).select('-password');
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    next(err);
  }
};
