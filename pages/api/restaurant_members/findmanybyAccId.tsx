import { PrismaClient } from "@prisma/client";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";
const prisma = new PrismaClient();

export async function getManyRestaurantMembersbyAccId(req, res) {
  const response = await prisma.rESTAURANT_MEMBERS.findMany({
    where: { ACCOUNT_PROFILE_ID: parseInt(req.user.ID), IS_ACTIVE: true },
    include: {
      RESTAURANT: true
    },
    orderBy: [{ ID: "asc" }],
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

  getManyRestaurantMembersbyAccId(req, res)
})
// http://localhost:3000/api/restaurant_members/findmanybyAccId

export default apiRoute;
