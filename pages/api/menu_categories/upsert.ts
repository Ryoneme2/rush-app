import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upsertMenuCategoriesById(req, res) {
  const data = req.body;
  const response = await prisma.mENU_CATEGORIES.upsert({
    where: { ID: parseInt(data.id) ?? 0 },
    update: {
      NAME: data.name.toString(),
      DESCRIPTION: data.description.toString(),
      ICON_NAME: data.iconName.toString(),
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
    create: {
      NAME: data.name.toString(),
      DESCRIPTION: data.description.toString(),
      ICON_NAME: data.iconName.toString(),
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
  });

  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/menu_categories/upsert
export default upsertMenuCategoriesById;
