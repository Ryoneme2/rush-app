import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyadmin(req, res) {
    const data = req.body;
    const adminType = await prisma.aCCOUNT_TYPE.findFirst({
        where: { NAME: process.env.TYPE_ADMIN_NAME }
    })
    await prisma.$disconnect()
    const ownerType = await prisma.aCCOUNT_TYPE.findFirst({
        where: { NAME: process.env.TYPE_OWNER_NAME }
    })
    await prisma.$disconnect()
    const response = await prisma.aCCOUNT_PROFILE.findMany({
        where: {
            OR: [
                { ACCOUNT_TYPE_ID: adminType.ID },
                { ACCOUNT_TYPE_ID: ownerType.ID }
            ], IS_ACTIVE: true
        },
        include: { ACCOUNT_INTERNAL: true },
        orderBy: [{ ID: "asc" }],
    });

    await prisma.$disconnect()
    if (response) {
        res.status(200).json(response);
    } else res.status(400).json({});
}
// http://localhost:3000/api/account_profile/findmanyadmin

export default getManyadmin;
