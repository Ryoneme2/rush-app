import { PrismaClient } from "@prisma/client";
import nextConnect from "next-connect";
import authMiddleware from "pages/api/utils/verify.middlewere";

const prisma = new PrismaClient();

export async function getHistory(req, res) {
    const data = req.body;

    const response = await prisma.bOOKING.findMany({
        where: { CUSTOMER_ID: parseInt(req.user.ID) },
        include: { RESTAURANT: { select: { NAME: true, DESCRIPTION: true, ADDRESS: true, WORK_HOURS_DESCRIPTION: true, RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } } } }, BOOKING_TABLES: { select: { TABLE: { select: { ID: true, NAME: true, SEATS_AMOUNT: true, AREA: true } } } }, BOOKING_PACKAGE_SELECT: { select: { BOOKING_PACKAGE: true } } },
        orderBy: [{ BOOK_DATETIME: "desc" }],
    });


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
apiRoute.get(authMiddleware, (req: any, res: any) => {

    getHistory(req, res)
})
// http://localhost:3000/api/action/booking/history

export default apiRoute;
