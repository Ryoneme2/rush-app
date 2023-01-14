import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getById(req, res) {
  const data = req.body;

  const response = await prisma.bOOKING_PACKAGE.findFirst({
    where: {
      ID: parseInt(data.id),
      RESTAURANT_ID: parseInt(data.restaurantId),
    },
  });

  await prisma.$disconnect()

     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/booking_package/getById/
export default getById;
