import { PrismaClient } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";

const prisma = new PrismaClient();

export async function upsertArea(req, res) {
  const data = req.body;


  const response = await prisma.aREA.upsert({
    where: { ID: parseInt(data.id) ?? 0 },
    update: {
      NAME: data.name,
      DESCRIPTION: data.description,
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
    create: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      NAME: data.name,
      DESCRIPTION: data.description,
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
  });
  await prisma.$disconnect()
  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
}
// http://localhost:3000/api/area/upsert

export default upsertArea;
