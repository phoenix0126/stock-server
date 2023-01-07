const { Router } = require("express");
const { PrismaClient, Role } = require("@prisma/client");
const { prismaExclude } = require("prisma-exclude");

const isEmpty = require("../utils/is-Empty");
const { parse } = require("dotenv");

const router = Router();

const prisma = new PrismaClient();
const exclude = prismaExclude(prisma);

// @API     GET /setting/
// @DESC    Get all settings
// @PARAMS  user id
router.get("/", async (req, res) => {
  const settings = await prisma.mailSetting.findMany();

  return res.status(200).json(settings);
});

// @APO     GET /setting/active
// @DESC    Get all active settings
// @PARAMS
router.get("/active", async (req, res) => {
  const setting = await prisma.mailSetting.findMany({
    where: {
      active: true,
    },
  });

  return res.status(200).json(setting);
});

// @API     POST /setting/
// @DESC    Add new type mail setting
// @PARAMS  userId, type & minXSD
router.post("/", async (req, res) => {
  const { timeframe, minXSD } = req.body;

  console.log(req.body);

  const newMailSetting = await prisma.mailSetting.create({
    data: {
      timeframe: parseInt(timeframe),
      minXSD: parseFloat(minXSD),
      active: true,
    },
  });

  return res.status(200).json(newMailSetting);
});

// @API     PUT /setting/:id
// @DESC    update mail setting
// @PARAMS  id, new minXSD
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { minXSD } = req.body;

  const setting = await prisma.mailSetting.update({
    where: {
      id: parseInt(id),
    },
    data: {
      minXSD: parseFloat(minXSD),
    },
  });

  return res.status(200).json(setting);
});

// @API     PUT /setting/:id/enable
// @DESC    update mail setting enable
// @PARAMS  id
router.put("/:id/enable", async (req, res) => {
  const { id } = req.params;
  const setting = await prisma.mailSetting.update({
    where: {
      id: parseInt(id),
    },
    data: {
      active: true,
    },
  });
  return res.status(200).json(setting);
});

// @API     PUT /setting/:id/disable
// @DESC    update mail setting disable
// @PARAMS  id
router.put("/:id/disable", async (req, res) => {
  const { id } = req.params;
  const setting = await prisma.mailSetting.update({
    where: {
      id: parseInt(id),
    },
    data: {
      active: false,
    },
  });
  return res.status(200).json(setting);
});

// @API   DELETE /setting/
// @DESC  Delete all settings
// @PARAMS
router.delete("/", async (req, res) => {
  const result = await prisma.mailSetting.deleteMany();
  return res.status(200).json(result);
});

module.exports = {
  router: router,
};
