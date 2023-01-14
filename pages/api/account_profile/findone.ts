import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyadmin(req, res) {
    const data = req.body;

    const response = await prisma.aCCOUNT_PROFILE.findFirst({
        where: { ID: parseInt(data.id), IS_ACTIVE: true },
        include: { ACCOUNT_INTERNAL: true },
        orderBy: [{ ID: "asc" }],
    });
    await prisma.$disconnect()
    const dropdown = await prisma.aCCOUNT_TYPE.findMany({
        where: { IS_ACTIVE: true }
    })

    await prisma.$disconnect()

    if (response) {
        res.status(200).json({ account: response, dropdown });
    } else res.status(400).json({});
}
// http://localhost:3000/api/account_profile/findone

export default getManyadmin;
