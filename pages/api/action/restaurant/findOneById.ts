import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyRestaurant(req, res) {
    const data = req.body;
    const response = await prisma.rESTAURANT.findFirst({
        where: { ID: parseInt(data.restaurantId), IS_ACTIVE: true },
        include: {
            RESTAURANT_CATEGORIES: true, RESTAURANT_CONTACT: true,
            RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } },
            RESTAURANT_MUSIC_STYLE: { where: { IS_ACTIVE: true }, include: { MUSIC_STYLE: true } },
            RESTAURANT_PLAN: { where: { IS_ACTIVE: true } },
            BOOKING_PACKAGE: true, AREA: { select: { ID: true, NAME: true, DESCRIPTION: true, TABLE: true } }
        },
        orderBy: [{ ID: "asc" }],
    });
    await prisma.$disconnect()
      if (response) {
        res.status(200).json(response);
      } else res.status(400).json({});
}
// http://localhost:3000/api/action/restaurant/findOneById

export default getManyRestaurant;
