import { PrismaClient } from "@prisma/client";
import { compare, hash } from 'bcryptjs'
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";
const prisma = new PrismaClient();

export async function changePassword(req, res) {
    const data = req.body;




    const accountInternal = await prisma.aCCOUNT_INTERNAL.findFirst({
        where: {
            ACCOUNT_PROFILE_ID: parseInt(req.user.ID),
        }
    })
    await prisma.$disconnect()
    if (accountInternal && await compare(data.oldPassword, accountInternal.PASSWORD_HASH)) {
        await prisma.aCCOUNT_INTERNAL.update({
            where: {
                ACCOUNT_PROFILE_ID: parseInt(req.user.ID),
            },
            data: {
                PASSWORD_HASH: await hash(data.newPassword, parseInt(process.env.HASH_SALT))
            }
        })

        await prisma.$disconnect()
        if (accountInternal) {
            res.status(200).json(accountInternal);
        } else res.status(400).json({});
    } else {
        res.status(400).json({ msg: 'Not found user or password not correct' })
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

    changePassword(req, res)
})
// http://localhost:3000/api/action/register/changepassword

export default apiRoute;

