import { PrismaClient } from "@prisma/client";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";
const prisma = new PrismaClient();

export async function getCheckRole(req, res) {

    const data = req.body;

    const adminType = await prisma.aCCOUNT_TYPE.findFirst({
        where: { NAME: process.env.TYPE_ADMIN_NAME }
    })
    await prisma.$disconnect()
    const ownerType = await prisma.aCCOUNT_TYPE.findFirst({
        where: { NAME: process.env.TYPE_OWNER_NAME }
    })
    await prisma.$disconnect()

    // เลือกทุก property
    const response = await prisma.aCCOUNT_PROFILE.findFirst({
        where: {
            ID: parseInt(req.user.ID),
            OR: [
                { ACCOUNT_TYPE_ID: adminType.ID },
                { ACCOUNT_TYPE_ID: ownerType.ID }
            ]
        },
    });


    await prisma.$disconnect()
    if (response) {
        res.status(200).json(response);
    } else res.status(400).json({});
}
const apiRoute = nextConnect({
    onError(error, req, res: any) {
        res
            .status(501)
            .json({ error: `Sorry something Happened! ${error.message}` });
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});
apiRoute.get(authMiddleware, (req: any, res: any) => {

    getCheckRole(req, res)
})
// http://localhost:3000/api/account_profile/checkrole
export default apiRoute;
