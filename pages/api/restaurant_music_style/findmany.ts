import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyRestaurant(req, res) {
  const data = req.body;

  const response = await prisma.rESTAURANT_MUSIC_STYLE.findMany({
    where: { RESTAURANT_ID: parseInt(data.restaurantId) },
    include: { MUSIC_STYLE: true },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/restaurant_music_style/findmany

export default getManyRestaurant;
