import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyRestaurant(req, res) {
  const response = await prisma.rESTAURANT.findMany({
    where: { IS_ACTIVE: true },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/restaurant/findmany

export default getManyRestaurant;
