import { PrismaClient } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";
import dayjs from "dayjs";
const prisma = new PrismaClient();

export async function upsertArea(req, res) {
  const data = req.body;

  console.log({ body: req.body });

  console.log({ date_time: data.bookingDatetime });
  console.log(dayjs(data.bookingDatetime).add(7, 'hour').toDate());

  const bOOKING = await prisma.bOOKING.create({
    data: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      CUSTOMER_ID: parseInt(req.user.ID),
      GUESTS_AMOUNT: parseInt(data.guests_amount),
      BOOK_DATETIME: dayjs(data.bookingDatetime).add(7, 'hour').toDate(),
      TOTAL_PRICE: parseFloat(data.totalPrice),
      STATUS: data.status,
      IS_APPROVE: data.isApprove ?? false,
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
  })
  data.BOOKING_TABLES = data.BOOKING_TABLES.map((d) => {
    return {
      BOOKING_ID: bOOKING.ID,
      TABLE_ID: parseInt(d),
      MODIFY_DATETIME: new Date(),
      IS_ACTIVE: true,
      CREATE_DATETIME: new Date()
    }
  })

  data.BOOKING_PACKAGE_SELECT = data.BOOKING_PACKAGE_SELECT.map((d) => {
    return {
      BOOKING_ID: bOOKING.ID,
      BOOKING_PACKAGE_ID: parseInt(d),
      MODIFY_DATETIME: new Date(),
      IS_ACTIVE: true,
      CREATE_DATETIME: new Date()
    }
  })

  const bOOKING_TABLES = prisma.bOOKING_TABLES.createMany({
    data: data.BOOKING_TABLES
  })
  const bOOKING_PACKAGE_SELECT = prisma.bOOKING_PACKAGE_SELECT.createMany({
    data: data.BOOKING_PACKAGE_SELECT
  })
  await prisma.$transaction([bOOKING_TABLES, bOOKING_PACKAGE_SELECT])
  await prisma.$disconnect();
  if (bOOKING) {
    res.status(200).json(bOOKING);
  } else res.status(400).json({});

}

const apiRoute = nextConnect({
  onError(error, req, res: any) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
apiRoute.post(authMiddleware, (req: any, res: any) => {

  upsertArea(req, res)
})
// http://localhost:3000/api/action/booking/create

export default apiRoute;
