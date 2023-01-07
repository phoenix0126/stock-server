const { Router } = require("express");
const { PrismaClient, Role } = require("@prisma/client");

const router = Router();

const prisma = new PrismaClient();

// @API     GET /indice/
// @DESC    Get all indices info
// @PARAMS  
router.get("/", async (req, res) => {
    const indices = await prisma.indice.findMany();

    return res.status(200).json(indices);
})

// @API     GET /indice/:no
// @DESC    Get all indices info by indice no
// @PARAMS  indice no
router.get("/:no", async (req, res) => {
    const { no } = req.params;
    const { from, to } = req.body;
    const indices = await prisma.indice.findMany({
        where: {
            no: Number(no),
            date: {
                gte: new Date(from),
                lte: new Date(to)
            }
        },
        orderBy: [
            {
                date: 'desc'
            }
        ]
    })

    return res.status(200).json(indices);
})

// @API     GET /indice/:no/count
// @DESC    Get count of specific indice
// @PARAMS  indice no
router.get("/:no/count", async (req, res) => {
    const { no } = req.params;
    const { from, to } = req.body;
    const indices_cnt = await prisma.indice.count({
        where: {
            no: Number(no),
            date: {
                gte: new Date(from),
                lte: new Date(to)
            }
        }
    })

    return res.status(200).json({count: indices_cnt})
})

// @API     POST /indice/
// @DESC    Add new indice
// @PARAMS  
router.post("/", async (req, res) => {
    const { no, date, close } = req.body;
    const newIndice = await prisma.indice.create({
        data: {
            no: Number(no),
            date: new Date(date),
            close: Number(close)
        }
    });

    return res.status(200).json(newIndice);
})

// @API     DELETE /indice/:no
// @DESC    Delete indice info by no
// @PARAMS  indice no
router.delete("/:no", async (req, res) => {
    const { no } = req.params;
    const deleteIndice = await prisma.indice.deleteMany({
        where: {
            no: Number(no)
        }
    });
    return res.status(200).json(deleteIndice);
})

// @API     DELETE /indice
// @DESC    Delete all indices
// @PARAMS  
router.delete("/", async (req, res) => {
    const deleteAllIndice = await prisma.indice.deleteMany();

    return res.status(200).json(deleteAllIndice);
})

module.exports = {
    router: router,
};