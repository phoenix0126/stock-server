const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");

const router = Router();

const prisma = new PrismaClient();

// @API     GET /analyze
// @DESC    Get AnalyzeIndice data
// @PARAMS
router.get("/", async (req, res) => {
    const analyze = await prisma.AnalyzeIndice.findMany();

    return res.status(200).json(analyze)
})

// @API     GET /analyze/:pairID
// @DESC    Get AnalyzeIndice data
// @PARAMS
router.get("/:range", async(req, res) => {
    const { range } = req.params;
    const analyze = await prisma.AnalyzeIndice.findMany({
        where: {
            range: Number(range)
        },
        orderBy: [
            {
                xsd: 'desc'
            }
        ]
    });

    return res.status(200).json(analyze)
})

// @API     GET /analyze
// @DESC    Get AnalyzeIndice data
// @PARAMS
router.delete("/", async (req, res) => {
    const analyze = await prisma.AnalyzeIndice.deleteMany();

    return res.status(200).json(analyze)
})

module.exports = {
    router: router,
};