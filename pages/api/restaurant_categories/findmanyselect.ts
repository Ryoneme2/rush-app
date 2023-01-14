import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyRestaurantCategories(req, res) {
  const data = req.body;

  const response = await prisma.rESTAURANT_CATEGORIES.findMany({
    where: { IS_ACTIVE: true },
    orderBy: [{ ID: "asc" }],
  });

  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/restaurant_categories/findmanyselect

export default getManyRestaurantCategories;
