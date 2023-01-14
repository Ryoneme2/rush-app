import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function postUpdateRole(req, res) {
    const data = req.body;

    const internal = await prisma.aCCOUNT_INTERNAL.findFirst({
        where: { EMAIL: data.email }
    });
    await prisma.$disconnect()
    if (internal) {
        const profile = await prisma.aCCOUNT_PROFILE.update({
            where: { ID: internal.ACCOUNT_PROFILE_ID },
            data: {
                ACCOUNT_TYPE_ID: parseInt(data.accountTypeId),
                MODIFY_DATETIME: new Date()
            }
        })
        await prisma.$disconnect()
        if (profile) {
            res.status(200).json(profile);
        } else res.status(400).json({});
    }

    await prisma.$disconnect()
    res.status(400).json("not mail correct");
}
// http://localhost:3000/api/account_profile/updaterole

export default postUpdateRole;
