import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertBookingById(req, res) {
  const data = req.body;

  const response = await Promise.all(
    data.map(
      async (data) =>
        await prisma.bOOKING_PACKAGE.upsert({
          where: { ID: data.id ?? 0 },
          update: {
            RESTAURANT_ID: data.restaurantId,
            NAME: data.name.toString(),
            DESCRIPTION: data.description.toString(),
            PRICE: data.price,
            IS_ACTIVE: data.isActive ?? true,
            MODIFY_DATETIME: new Date(),
          },
          create: {
            RESTAURANT_ID: data.restaurantId,
            NAME: data.name.toString(),
            DESCRIPTION: data.description.toString(),
            PRICE: data.price,
            IS_ACTIVE: data.isActive ?? true,
            MODIFY_DATETIME: new Date(),
          },
        })
    )
  );


  await prisma.$disconnect()
  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
}

// http://localhost:3000/api/booking_package/upsert
export default upsertBookingById;
