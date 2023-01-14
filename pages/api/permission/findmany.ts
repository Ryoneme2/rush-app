import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getManyPermission(req, res) {
  const data = req.body;

  const response = await prisma.pERMISSION.findMany({

    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/permission/findmany

export default getManyPermission;
