import { PrismaClient } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";

const prisma = new PrismaClient();

export async function upsertBooking(req, res) {
  const data = req.body;

  const response = await prisma.bOOKING.upsert({
    where: { ID: parseInt(data.id) ?? 0 },
    update: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      CUSTOMER_ID: data.customerId,
      GUESTS_AMOUNT: data.guestsAmount,
      BOOK_DATETIME: data.bookDatetime ?? new Date(),
      TOTAL_PRICE: data.totalPrice,
      STATUS: data.status,
      IS_APPROVE: data.isApprove,
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
    create: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      CUSTOMER_ID: data.customerId,
      GUESTS_AMOUNT: data.guestsAmount,
      BOOK_DATETIME: data.bookDatetime ?? new Date(),
      TOTAL_PRICE: data.totalPrice,
      STATUS: data.status,
      IS_APPROVE: data.isApprove,
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
  });
  await prisma.$disconnect()
    if (response) {
      res.status(200).json(response);
    } else res.status(400).json({});
}
// http://localhost:3000/api/action/booking/upsert

export default upsertBooking;
