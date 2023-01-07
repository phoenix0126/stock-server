const { Router } = require("express");
const { PrismaClient, Role } = require("@prisma/client");
const { prismaExclude } = require("prisma-exclude");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config/keys");
const isEmpty = require("../utils/is-Empty");
const ValidateSignIn = require("../utils/validationSignIn").validateSignIn;
const ValidateSignUp = require("../utils/validateSignUp").validateSignUp;

const router = Router();

const prisma = new PrismaClient();
const exclude = prismaExclude(prisma);

// @API     POST /signin
// @DESC    Sign in
// @PARAMS  User email & password
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const { errors, isValid } = ValidateSignIn(req.body);

  // validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    errors.email = "User not found";
    return res.status(400).json(errors);
  }

  // check password
  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) {
    errors.password = "Password incorrect";
    res.status(400).json(errors);
  }

  // User matched
  const payload = {
    id: user.id,
  };

  // jsonwebtoken generate
  jwt.sign(payload, config.secretOrKey, { expiresIn: 3600 }, (error, token) => {
    if (error) {
      errors.token = "Error generating token";
      return res.status(400).json(errors);
    }

    return res.status(200).json({
      success: true,
      token: token,
    });
  });
});

// @API     POST /signup
// @DESC    Sign up new user
// @PARAMS  User data
router.post("/signup", async (req, res) => {
  const { errors, isValid } = ValidateSignUp(req.body);

  // validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // check email already exist
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (user) {
    errors.email = "Email already exist";
    return res.status(400).json(errors);
  }

  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(req.body.password, salt);

  const newUser = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      password: hash,
      role: Role.USER,
    },
  });

  return res.status(200).json(newUser);
});

// @API     POST /verify
// @DESC    Verify token
// @PARAMS  Token data
router.post("/verify", async (req, res) => {
  const { token } = req.body;

  if (isEmpty(token)) {
    res.status(301).json({
      verify: false,
      error: "Empty token",
    });
  } else {
    try {
      const decoded = jwt.verify(token, config.secretOrKey);

      const { id } = decoded;

      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (user) res.status(200).json(user);
      else
        res.status(301).json({
          verify: false,
          error: "User not found",
        });
    } catch (error) {
      res.status(301).json({
        verify: false,
        error: error,
      });
    }
  }
});

// @API     PUT /update
// @DESC    Update Auth
// @PARAMS  User name & email
router.put("/:id", async (req, res) => {
  const user = await prisma.user.update({
    where: {
      id: Number(req.params.id),
    },
    select: {
      ...exclude("user", ["password"]),
    },
    data: req.body,
  });

  res.status(200).json(user);
});

// @API     POST /resetpassword
// @DESC    Reset the password
// @PARAMS  user email & current password & new password
router.post("/resetpassword", async (req, res) => {
  const { email, newPassword, currentPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) return res.status(400).json({ email: "User not found" });

  const isMatchCurrentPassword = await bcryptjs.compare(
    currentPassword,
    user.password
  );

  if (!isMatchCurrentPassword)
    return res
      .status(400)
      .json({ password: "Current password does not match" });

  if (currentPassword === newPassword)
    return res
      .status(400)
      .json({ password: "New password is equal to current password" });

  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(newPassword, salt);

  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      password: hash,
    },
  });

  res.status(200).json();
});

module.exports = {
  router: router,
};
