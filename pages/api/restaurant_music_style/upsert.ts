import { PrismaClient } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";

const prisma = new PrismaClient();

export async function upsertRestaurantMusicStyle(req, res) {
  const data = req.body;

  // const idAccountProfile = 1;

  const response = await prisma.rESTAURANT_MUSIC_STYLE.upsert({
    where: { ID: parseInt(data.id) ?? 0 },
    update: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      MUSIC_STYLE_ID: parseInt(data.musicStyleId),
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
    create: {
      RESTAURANT_ID: parseInt(data.restaurantId),
      MUSIC_STYLE_ID: parseInt(data.musicStyleId),
      IS_ACTIVE: data.isActive ?? true,
      MODIFY_DATETIME: new Date(),
    },
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json({});
     } else res.status(400).json({});
}
// http://localhost:3000/api/restaurant_music_style/upsert

export default upsertRestaurantMusicStyle;
