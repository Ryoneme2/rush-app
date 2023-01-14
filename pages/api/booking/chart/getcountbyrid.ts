import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCountBookingById(req, res) {
  const data = req.body;

  // เลือกทุก property
  const responseCard = await prisma.bOOKING.groupBy({
    by: ['RESTAURANT_ID'],
    where: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      BOOK_DATETIME: {
        gte: data.BookingStartDatetime,
        lt: data.BookingEndDatetime,
      },
      IS_ACTIVE: true,
      IS_APPROVE: true
    },
    _count: { ID: true },
    _sum: { TOTAL_PRICE: true }
  });
  await prisma.$disconnect()
  const responseBooking = await prisma.bOOKING.findMany({
    where: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      BOOK_DATETIME: {
        gte: data.BookingStartDatetime,
        lt: data.BookingEndDatetime,
      },
      IS_ACTIVE: true,
      IS_APPROVE: true
    },
    select: {
      BOOK_DATETIME: true,
      BOOKING_TABLES: {
        select: { TABLE: { select: { AREA: true } } },
      },
    },
  });
  await prisma.$disconnect()
  const responseArea = await prisma.aREA.findMany({
    where: {
      RESTAURANT_ID: parseInt(data.restaurantId),
    },
  });


  await prisma.$disconnect();
  if (responseBooking) {
    res
      .status(200)
      .json({
        Booking: responseBooking,
        Area: responseArea,
        Card: responseCard,
      });
  } else res.status(400).json({});

}

// http://localhost:3000/api/booking/chart/getcountbyrid
export default getCountBookingById;
