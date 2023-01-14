import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getFindoneContactProvider(req, res) {
  const data = req.body;


  const response = await prisma.cONTACT_PROVIDER.findFirst({
    where: { ID: parseInt(data.id) },
  });
  await prisma.$disconnect();


     if (response) {
       res.status(200).json(response);
     } else res.status(400).json({});
}
// http://localhost:3000/api/contact_provider/findone

export default getFindoneContactProvider;
