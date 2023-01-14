import { PrismaClient } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";

const prisma = new PrismaClient();

export async function upsertRestaurantById(req, res) {
  const data = req.body;

  const idAccountProfile = 1;


  const response = await Promise.all(
    data.map(async (data) =>
      await prisma.rESTAURANT.upsert({
        where: { ID: data.id ?? 0 },
        update: {
          RESTAURANT_CATEGORIES_ID: parseInt(data.restaurantCatagoriesId),
          NAME: data.name.toString(),
          DESCRIPTION: data.description.toString(),
          LAT: data.lat.toString(),
          LONG: data.long.toString(),
          WORK_HOURS_DESCRIPTION: data.workHoursDescription.toString(),
          ADDRESS: data.address.toString(),
          IS_ACTIVE: data.isActive ?? true,
          MODIFY_DATETIME: new Date(),
        },
        create: {
          RESTAURANT_CATEGORIES_ID: parseInt(data.restaurantCatagoriesId),
          NAME: data.name.toString(),
          DESCRIPTION: data.description.toString(),
          LAT: data.lat.toString(),
          LONG: data.long.toString(),
          WORK_HOURS_DESCRIPTION: data.workHoursDescription.toString(),
          ADDRESS: data.address.toString(),
          IS_ACTIVE: data.isActive ?? true,
          MODIFY_DATETIME: new Date(),
        },
      })));
  await prisma.$disconnect()
  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
}


// http://localhost:3000/api/restaurant/upsert
export default upsertRestaurantById;
