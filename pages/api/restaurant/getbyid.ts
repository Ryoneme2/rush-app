import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRestaurantById(req, res) {
  //เลือกแค่บาง property
  //   const data = await prisma.rESTAURANT.findFirst({
  //     where: { ID: parseInt(req.query.id) },
  //     select: { NAME: true, RESTAURANT_CATEGORIES: { select: { NAME: true } } },
  //   });

  const data = req.body;


  // เลือกทุก property
  const response = await prisma.rESTAURANT.findFirst({
    where: { ID: parseInt(data.id) },
    include: {
      RESTAURANT_CATEGORIES: true,
    },
  });


  await prisma.$disconnect()
  if (response) { res.status(200).json(response); }
  else res.status(400).json({});
}

// http://localhost:3000/api/restaurant/getbyid
export default getRestaurantById;
