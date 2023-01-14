// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function getCheckBkTbAvailable(req, res) {
//   const data = req.body;

//   const response = await prisma.bOOKING.findFirst({
//     where: {
//       RESTAURANT_ID: parseInt(data.restaurantId),
//       BOOK_DATETIME: {
//         gte: data.bookStartDatetime,
//         lt: data.bookEndDatetime,
//       }, IS_ACTIVE: true,
//       // IS_APPROVE: true
//     },
//     select: {
//       BOOKING_TABLES: {select: { TABLE: true } }
//     },

//     orderBy: [{ ID: "asc" }],
//   });
//   await prisma.$disconnect()

//   if (!response) {
//     res.status(200).json(response);
//   } else res.status(400).json(response);
// }
// // http://localhost:3000/api/action/booking/findCheckBkTbAvailable

// export default getCheckBkTbAvailable;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCheckBkTbAvailable(req, res) {
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
      BOOKING_TABLES: {where:{TABLE_ID: data.tableId}, select: { TABLE: true } }
    },

    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
  // console.log(response);
  // console.log(response[0].BOOKING_TABLES);
  // console.log(Boolean(response));
  // console.log(!response);
  // console.log(response.length);
  // console.log(!Boolean((response.filter((x)=> x.BOOKING_TABLES.length > 0)).length > 0));
  if (!Boolean((response.filter((x)=> x.BOOKING_TABLES.length > 0)).length > 0)) {
    res.status(200).json(response);
  } else res.status(400).json(response);
}
// http://localhost:3000/api/action/booking/findCheckBkTbAvailable

export default getCheckBkTbAvailable;