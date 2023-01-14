import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPermissionById(req, res) {

  const data = req.body;


  // เลือกทุก property
  const response = await prisma.pERMISSION.findFirst({
    where: { ID: parseInt(data.id) },
  });

  await prisma.$disconnect()
     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}

// http://localhost:3000/api/permission/getbyid
export default getPermissionById;