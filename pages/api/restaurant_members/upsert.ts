import { PrismaClient } from "@prisma/client";
import { NextRouter, useRouter } from "next/router";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";
const prisma = new PrismaClient();

export async function upsertRestaurantMember(req, res) {
  const data = req.body;

  // const idAccountProfile = 1;

  const response = await Promise.all(
    data.map(async (data) => {
      const responseRestauarant = await prisma.rESTAURANT.upsert({
        where: { ID: data.id ?? 0 },
        update: {
          RESTAURANT_CATEGORIES_ID: parseInt(data.restaurantCatagoriesId),
          NAME: data.name.toString(),
          DESCRIPTION: data.description.toString(),
          LAT: data.lat.toString(),
          LONG: data.long.toString(),
          ADDRESS: data.address.toString(),
          WORK_HOURS_DESCRIPTION: data.workHoursDescription.toString(),
          CONDITION: data.condition.toString(),
          FEE: parseFloat(data.fee),
          IS_CANCLE_POLICY: data.isCanclePolicy ?? true,
          IS_ACTIVE: data.isActive ?? true,
          MODIFY_DATETIME: new Date(),
          FIX_DATE: data.fixDate ?? null,
        },
        create: {
          RESTAURANT_CATEGORIES_ID: parseInt(data.restaurantCatagoriesId),
          NAME: data.name.toString(),
          DESCRIPTION: data.description.toString(),
          LAT: data.lat.toString(),
          LONG: data.long.toString(),
          ADDRESS: data.address.toString(),
          WORK_HOURS_DESCRIPTION: data.workHoursDescription.toString(),
          CONDITION: data.condition.toString(),
          FEE: parseFloat(data.fee),
          IS_CANCLE_POLICY: data.isCanclePolicy ?? true,
          IS_ACTIVE: data.isActive ?? true,
          MODIFY_DATETIME: new Date(),
          FIX_DATE: data.fixDate ?? null,
        },
      });

      const isRestaurantMember = await prisma.rESTAURANT_MEMBERS.findFirst({
        where: { RESTAURANT_ID: responseRestauarant.ID },
      });


      if (!isRestaurantMember) {
        await prisma.rESTAURANT_MEMBERS.create({
          data: {
            RESTAURANT_ID: responseRestauarant.ID,
            ACCOUNT_PROFILE_ID: parseInt(req.user.ID),
            IS_ACTIVE: data.isActive ?? true,
          },
        });

      } else {
        await prisma.rESTAURANT_MEMBERS.updateMany({
          where: { RESTAURANT_ID: responseRestauarant.ID, ACCOUNT_PROFILE_ID: parseInt(req.user.ID) },
          data: {
            IS_ACTIVE: data.isActive ?? true
          }
        })
      }
      return responseRestauarant
    })
  );
  await prisma.$disconnect()
  if (response) {
    res.status(200).json(response);
  } else res.status(400).json({});
}
const apiRoute = nextConnect({
  onError(error, req, res: any) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
apiRoute.post(authMiddleware, (req: any, res: any) => {

  upsertRestaurantMember(req, res)
})
// http://localhost:3000/api/restaurant_members/upsert

export default apiRoute;
