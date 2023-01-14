import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyBkTbAvailable(req, res) {
  const data = req.body;

  const response = await prisma.bOOKING.findMany({
    where: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      BOOK_DATETIME: {
        gte: data.bookStartDatetime,
        lt: data.bookEndDatetime,
      }, IS_ACTIVE: true,
      // IS_APPROVE: true
    },
    select: {
      BOOKING_TABLES: { select: { TABLE: true } }
    },

    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()

  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
}
// http://localhost:3000/api/action/booking/findmanyBkTbAvailable

export default getManyBkTbAvailable;
