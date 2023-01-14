import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyRestaurant(req, res) {
  const response = await prisma.rESTAURANT.findMany({
    where: { IS_ACTIVE: true },
    include: { RESTAURANT_CATEGORIES: true, RESTAURANT_CONTACT: true, RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } }, RESTAURANT_MUSIC_STYLE: true },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()

  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
}
// http://localhost:3000/api/action/restaurant/findmany

export default getManyRestaurant;
