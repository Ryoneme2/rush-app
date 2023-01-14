import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyMenuCategories(req, res) {
  const data = req.body;

  const response = await prisma.mENU_CATEGORIES.findMany({

    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/menu_categories/findmany

export default getManyMenuCategories;
