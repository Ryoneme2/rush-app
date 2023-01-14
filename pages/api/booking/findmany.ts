import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyBooking(req, res) {
  const data = req.body;
  let responsePackage;
  let responseTable;
  let responseAccount;
  let response;
  let responseBooking


  if (data.status == 'All') {
    responseBooking = await prisma.bOOKING.findMany({
      where: {
        RESTAURANT_ID: data.restaurantId,
        BOOK_DATETIME: { gte: data.dateGte, lt: data.dateLte },
      },
      orderBy: [{ ID: "asc" }],
      include: { BOOKING_PACKAGE_SELECT: true, BOOKING_TABLES: true },
    });
    await prisma.$disconnect()
  } else {
    responseBooking = await prisma.bOOKING.findMany({
      where: {
        RESTAURANT_ID: data.restaurantId,
        BOOK_DATETIME: { gte: data.dateGte, lt: data.dateLte },
        STATUS: data.status
      },
      orderBy: [{ ID: "asc" }],
      include: { BOOKING_PACKAGE_SELECT: true, BOOKING_TABLES: true },
    });
    await prisma.$disconnect()
  }

  responsePackage = await Promise.all(
    responseBooking.map(
      async (data) =>
        await Promise.all(
          data.BOOKING_PACKAGE_SELECT.map(
            async (data) =>
              await prisma.bOOKING_PACKAGE.findFirst({
                where: { ID: data.BOOKING_PACKAGE_ID },
              })


          )
        )
    )
  );
  await prisma.$disconnect()
  responseTable = await Promise.all(
    responseBooking.map(
      async (data) =>
        await Promise.all(
          data.BOOKING_TABLES.map(
            async (data) =>
              await prisma.tABLE.findFirst({ where: { ID: data.TABLE_ID } })
          )
        )
    )
  );
  await prisma.$disconnect()
  responseAccount = await Promise.all(
    responseBooking.map(
      async (data) =>
        await prisma.aCCOUNT_PROFILE.findFirst({
          where: { ID: data.CUSTOMER_ID },
        })
    )
  );
  await prisma.$disconnect()
  response = responseBooking.map((data, index) => {
    delete data.BOOKING_PACKAGE_SELECT;
    delete data.BOOKING_TABLES;
    return {
      BOOKING: data,
      ID: data.ID,
      IS_ACTIVE: data.IS_ACTIVE,
      IS_APPROVE: data.IS_APPROVE,
      STATUS: data.STATUS,
      PACKAGE: responsePackage[index],
      TABLE: responseTable[index],
      ACCOUNT: responseAccount[index],
    };
  });





  // responsePackage.push(await prisma)
  await prisma.$disconnect();
  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
  // res.status(200).json({BOOKING:responseBooking, BOOKING_PACKAGE:responsePackage , TABLE:responseTable });
}
// http://localhost:3000/api/booking/findmany

export default getManyBooking;
