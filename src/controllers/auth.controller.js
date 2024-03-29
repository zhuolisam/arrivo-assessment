const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const userModel = require('../models/user.model');
const tokenModel = require('../models/token.model');
const { verifyPassword } = require('../utils/hashPassword');

const register = catchAsync(async (req, res) => {
  const user = await userModel.getUserByEmail(req.body.email);
  if (user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const userResult = await userModel.createUser(req.body);
  res.status(httpStatus.CREATED).send({ userResult });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.getUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  const tokens = await tokenModel.generateAccessToken(user);
  res.send({
    user: {
      userid: user.userId,
      username: user.username,
      email: user.email,
      fullname: user.fullName,
      membership: user.membership,
    },
    access_token: tokens,
  });
});

module.exports = {
  register,
  login,
};
