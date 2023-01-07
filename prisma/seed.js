const { PrismaClient, Role } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient();

(async function main() {
  try {
    bcryptjs.genSalt(10, (error, salt) => {
      bcryptjs.hash("12345678", salt, async (error, hash) => {
        const admin = await prisma.user.create({
          data: {
            email: "admin@discrepancycharts.com",
            name: "admin",
            password: hash,
            role: Role.ADMIN,
          },
        });

        console.log("Created admin:", admin);

        const mail1Y = await prisma.mailSetting.create({
          data: {
            timeframe: 5,
            minXSD: 2,
          },
        });

        console.log("Create setting for 1 year", mail1Y);
      });
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
