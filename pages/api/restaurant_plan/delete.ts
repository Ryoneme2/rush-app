import { PrismaClient } from "@prisma/client";
import nextConnect from "next-connect";
import { upload } from "../utils/upload.middleware";
const prisma = new PrismaClient();

export async function upsertrestaurantGalleryById(req, res) {
    const data = req.body;



    const response =
        await prisma.rESTAURANT_PLAN.upsert({
            where: { ID: parseInt(data.id) ?? 0 },
            update: {
                RESTAURANT_ID: parseInt(data.restaurantId),
                FILE_NAME: "-",
                FILE_PATH: data.filePath,
                FILE_TYPE: "-",
                IS_ACTIVE: data.isActive ?? true,
                MODIFY_DATETIME: new Date()
            },
            create: {
                RESTAURANT_ID: parseInt(data.restaurantId),
                FILE_NAME: "-",
                FILE_PATH: data.filePath,
                FILE_TYPE: "-",
                IS_ACTIVE: data.isActive ?? true,
                MODIFY_DATETIME: new Date()
            },
        })





    await prisma.$disconnect()

       if (response) {
         res.status(200).json(response);
       } else res.status(400).json({});
}
// http://localhost:3000/api/restaurant_plan/delete
export default upsertrestaurantGalleryById;
