import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getSearchRestaurant(req, res) {
    const data = req.body;


    const name = await prisma.rESTAURANT.findMany({
        where: {
            NAME: {
                contains: data.search,
                mode: 'insensitive'
            },
            IS_ACTIVE : true
        }, include: { RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } } },
        orderBy: { NAME: 'asc' }
    })
    await prisma.$disconnect()
    const address = await prisma.rESTAURANT.findMany({
        where: {
            ADDRESS: {
                // search: String(data.search),
                contains: data.search,
                mode: 'insensitive'
            },
            IS_ACTIVE : true
        }, include: { RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } } },
        orderBy: { ADDRESS: 'asc' }
    })
    await prisma.$disconnect()



    if (name || address) {
        res.status(200).json({ NAME: name, ADDRESS: address });
    } else res.status(400).json({ NAME: [], ADDRESS: [] });

}
// http://localhost:3000/api/action/search/findmany

export default getSearchRestaurant;
