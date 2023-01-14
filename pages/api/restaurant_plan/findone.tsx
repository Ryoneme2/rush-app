import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getFindoneContactProvider(req, res) {
  const data = req.body;


  const response = await prisma.rESTAURANT_PLAN.findFirst({
    where: {
      ID: parseInt(data.id) ?? 0,
      IS_ACTIVE: true,
    },

  });
  await prisma.$disconnect();


     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/resturant_plan/findone

export default getFindoneContactProvider;
