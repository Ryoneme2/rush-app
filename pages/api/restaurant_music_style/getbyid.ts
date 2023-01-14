import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRestaurantById(req, res) {
  const data = req.body;

  // เลือกทุก property
  const response = await prisma.rESTAURANT_MUSIC_STYLE.findFirst({
    where: { RESTAURANT_ID: parseInt(data.restaurantId), ID: parseInt(data.musicStyleId) },
    include: {
      MUSIC_STYLE: true,
    },
  });


  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/restaurant_music_style/getbyid
export default getRestaurantById;
