import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyTable(req, res) {
  const data = req.body;

  const response = await prisma.tABLE.findMany({
    where: { AREA_ID: data.areaId },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/table/findmany

export default getManyTable;
