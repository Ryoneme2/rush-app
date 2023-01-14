import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertrestaurantContactById(req, res) {
  const data = req.body;

  const response =
    await prisma.rESTAURANT_CONTACT.upsert({
      where: { ID: parseInt(data.id) ?? 0 },
      update: {
        RESTAURANT_ID: parseInt(data.restaurantId),
        CONTACT_PROVIDER_ID: parseInt(data.contactProviderId),
        TITLE: data.title.toString(),
        DETAIL: data.detail.toString(),
        IS_ACTIVE: data.isActive ?? true,
        MODIFY_DATETIME: new Date(),
      },
      create: {
        RESTAURANT_ID: parseInt(data.restaurantId),
        CONTACT_PROVIDER_ID: parseInt(data.contactProviderId),
        TITLE: data.title.toString(),
        DETAIL: data.detail.toString(),
        IS_ACTIVE: data.isActive ?? true,
        MODIFY_DATETIME: new Date(),
      },
    })


  await prisma.$disconnect()

     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/restaurant_contact/upsert
export default upsertrestaurantContactById;
