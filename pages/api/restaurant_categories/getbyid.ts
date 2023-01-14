import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getRestaurantCategoriesById(req, res) {

  const data = req.body;


  // เลือกทุก property
  const response = await prisma.rESTAURANT_CATEGORIES.findFirst({
    where: { ID: parseInt(data.id) },
  });


  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/restaurant_categories/getbyid
export default getRestaurantCategoriesById;
