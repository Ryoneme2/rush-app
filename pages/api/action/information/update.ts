import { PrismaClient } from "@prisma/client";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";
const prisma = new PrismaClient();

export async function getManyRestaurant(req, res) {
    const data = req.body;
    const checkEmail = await prisma.aCCOUNT_INTERNAL.findMany({
        where: { EMAIL: data.email }
    })
    await prisma.$disconnect()
    if (checkEmail.length == 1) {
        const response = await prisma.aCCOUNT_PROFILE.update({
            where: { ID: parseInt(req.user.ID) },
            data: {
                FIRST_NAME: data.firstName,
                LAST_NAME: data.lastName,
                BIRTH_DATE: new Date(data.birthDate),
                PHONE: data.phone
            }

        });
        await prisma.aCCOUNT_INTERNAL.update({
            where: { ACCOUNT_PROFILE_ID: parseInt(req.user.ID) },
            data: { EMAIL: data.email }
        })
        await prisma.$disconnect()
        if (response) {
            res.status(200).json(response);
        } else res.status(400).json({});;
    } else {
        res.status(400).json({ msg: 'email have use' })
    }
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
apiRoute.post(authMiddleware, (req: any, res: any) => {

    getManyRestaurant(req, res)
})
// http://localhost:3000/api/action/information/update

export default apiRoute;
