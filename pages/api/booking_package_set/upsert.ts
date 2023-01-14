import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertBookingPackageSetById(req, res) {
  const data = req.body;


  const response = await Promise.all(
    data.map(async (data) => {
      const isBookingPackageSet = await prisma.bOOKING_PACKAGE_SET.findFirst({
        where: {
          BOOKING_PACKAGE_ID: data.bookingPackageId,
          MENU_ID: data.menuId,
        },
      });
      await prisma.$disconnect()

      if (!isBookingPackageSet) {
        await prisma.bOOKING_PACKAGE_SET.create({
          data: {
            BOOKING_PACKAGE_ID: data.bookingPackageId,
            MENU_ID: data.menuId,
            QTY: data.qty,
            IS_ACTIVE: data.isActive ?? true,
          },
        });
      } else {
        await prisma.bOOKING_PACKAGE_SET.update({
          where: { ID: isBookingPackageSet.ID },
          data: { QTY: data.qty, IS_ACTIVE: data.isActive },
        });
      }


      // await prisma.bOOKING_PACKAGE_SET.upsert({
      //   where: { ID: data.id ?? 0 },
      //   update: {
      //     BOOKING_PACKAGE_ID: data.bookingPackageId,
      //     MENU_ID: data.menuId,
      //     QTY: data.qty,
      //     IS_ACTIVE: data.isActive ?? true,
      //     MODIFY_DATETIME: new Date(),
      //   },
      //   create: {
      //     BOOKING_PACKAGE_ID: data.bookingPackageId,
      //     MENU_ID: data.menuId,
      //     QTY: data.qty,
      //     IS_ACTIVE: data.isActive ?? true,
      //     MODIFY_DATETIME: new Date(),
      //   },
      // })
    })
  );
  await prisma.$disconnect()

  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
}

// http://localhost:3000/api/booking_package_set/upsert
export default upsertBookingPackageSetById;
