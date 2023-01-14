import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertMenuById(req, res) {
  const data = req.body;

  const response = await Promise.all(
    data.map(
      async (data) =>
        await prisma.mENU.upsert({
          where: { ID: data.id ?? 0 },
          update: {
            NAME: data.name.toString(),
            DESCRIPTION: data.description.toString(),
            PRICE: parseFloat(data.price),
            IS_ACTIVE: data.isActive ?? true,
            MODIFY_DATETIME: new Date(),
          },
          create: {
            MENU_CATEGORIES_ID: parseInt(data.menuCategoriesId) ?? 0,
            RESTAURANT_ID: parseInt(data.restaurantId) ?? 0,
            NAME: data.name.toString(),
            DESCRIPTION: data.description.toString(),
            PRICE: parseFloat(data.price),
            IS_ACTIVE: data.isActive ?? true,
            MODIFY_DATETIME: new Date(),
          },
        })
    )
  );

  await prisma.$disconnect();
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/menu/upsert
export default upsertMenuById;
