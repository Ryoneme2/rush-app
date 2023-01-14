import { PrismaClient } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";

const prisma = new PrismaClient();

export async function upsertTable(req, res) {
  const data = req.body;

  const idAccountProfile = 1;

  const response = await prisma.tABLE.upsert({
    where: { ID: parseInt(data.id) ?? 0 },
    update: {
      NAME: data.name,
      DESCRIPTION: data.description,
      SEATS_AMOUNT: parseInt(data.seatsAmount),
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
    create: {
      AREA_ID: parseInt(data.areaId),
      NAME: data.name,
      DESCRIPTION: data.description,
      SEATS_AMOUNT: parseInt(data.seatsAmount),
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/table/upsert

export default upsertTable;
