import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyBookingPackage(req, res) {
  const data = req.body;

  const response = await prisma.bOOKING_PACKAGE_SET.findMany({
    where: {BOOKING_PACKAGE_ID: data.bookingPackageId, IS_ACTIVE: true },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/booking_package_set/findmany

export default getManyBookingPackage;
