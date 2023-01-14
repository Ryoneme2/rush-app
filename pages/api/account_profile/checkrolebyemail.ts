import { PrismaClient } from "@prisma/client";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";
const prisma = new PrismaClient();

export async function getCheckRoleByEmail(req, res) {
    const data = req.body;

    // เลือกทุก property
    const response = await prisma.aCCOUNT_PROFILE.findFirst({
        where: {
            ACCOUNT_INTERNAL: { some: { EMAIL: data.email } }
        },
    });


    await prisma.$disconnect()
      if (response) {
        res.status(200).json(response);
      } else res.status(400).json({});
}

// http://localhost:3000/api/account_profile/checkrolebyemail
export default getCheckRoleByEmail;
