import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const authMiddleware = async (req, res, next) => {
  try {


    const session = await getSession({ req });;


    if (req.headers.authorization) {
      const secretKey: string = process.env.JWT_SECRET;
      const verificationResponse = await verify(req.headers.authorization.replace("Bearer ", ""), secretKey);
      const userId = verificationResponse.ID;
      const prisma = new PrismaClient();
      const users = prisma.aCCOUNT_PROFILE;
      const findUser = await users.findUnique({
        where: { ID: Number(userId) },
      });

      await prisma.$disconnect();

      if (findUser) {

        req.user = findUser;
        next();
      } else {
        res.status(401).json({ error: "Wrong authentication token" });
      }
    } else {
      res.status(404).json({ error: "Authentication token missing" });
    }
  } catch (error) {
    res.status(401).json({ error: "Wrong authentication token" });
  }
};

export default authMiddleware;
