import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function hallo(req, res) {
  prisma.aCCOUNT_INTERNAL.findFirst({
    where: { USERNAME: "losscreen" },
  }).then((data) => {
  })
}