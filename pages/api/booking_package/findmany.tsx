import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyBookingPackage(req, res) {
  const data = req.body;

  const response = await prisma.bOOKING_PACKAGE.findMany({
    where: { RESTAURANT_ID: data.restaurantId },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/booking_package/findmany

export default getManyBookingPackage;
