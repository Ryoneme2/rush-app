import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyMenuByRestaurantId(req, res) {
  const data = req.body;

  const response = await prisma.mENU.findMany({
    where: { RESTAURANT_ID: parseInt(data.restaurantId), IS_ACTIVE: true },
    orderBy: [{ ID: "asc" }],
  });

  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/menu/findmany/
export default getManyMenuByRestaurantId;
