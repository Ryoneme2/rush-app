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
        FILE_PATH: req.file.path,
        FILE_TYPE: "-",
        IS_ACTIVE: data.isActive ?? true,
        MODIFY_DATETIME: new Date()
      },
      create: {
        RESTAURANT_ID: parseInt(data.restaurantId),
        FILE_NAME: "-",
        FILE_PATH: req.file.path,
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

apiRoute.post(upload.single("image"), (req: any, res: any) => {
  // req.file.path = req.file.path.replace("public", "");
  req.file.path = req.file.location


  /** Save to database */
  upsertrestaurantGalleryById(req, res)
  // res.status(200).json();
});
// http://localhost:3000/api/resturant_plan/upsert
export default apiRoute;
export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
