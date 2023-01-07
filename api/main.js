const { Router } = require("express");
const axios = require("axios");
const { runProcess } = require("../utils/app");

const router = Router();

router.post("/run_process", async (req, res) => {
  const { from, to } = req.body;
  const result = await runProcess(from, to);
  return res.status(200).json(result);
})

module.exports = {
  router: router,
};
