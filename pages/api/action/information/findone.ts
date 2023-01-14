import { PrismaClient } from "@prisma/client";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";

const prisma = new PrismaClient();

export async function getFindone(req, res) {
    const data = req.body;

    const response = await prisma.aCCOUNT_PROFILE.findFirst({
        where: { ID: parseInt(req.user.ID) },
        include: { ACCOUNT_INTERNAL: true },

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

    getFindone(req, res)
})
// http://localhost:3000/api/action/information/findone

export default apiRoute;
