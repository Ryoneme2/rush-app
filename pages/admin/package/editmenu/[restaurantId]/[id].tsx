import CardListMenuForPackage from "components/Cards/CardListMenuForPackage";
import Admin from "layouts/Admin";
import { getSession } from "next-auth/react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { verify } from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";
export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const session = await getSession(context)

  if (!session) {
    return { redirect: { destination: '/auth/admin' } }
  }

  const secretKey: string = process.env.JWT_SECRET;
  const user = verify(session.tokenUser, secretKey)
  const adminType = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_ADMIN_NAME }
  })
  await prisma.$disconnect()
  const ownerType = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_OWNER_NAME }
  })
  await prisma.$disconnect()
  // เลือกทุก property
  const res = await prisma.aCCOUNT_PROFILE.findFirst({
    where: {
      ID: parseInt(user.ID),
      OR: [
        { ACCOUNT_TYPE_ID: adminType.ID },
        { ACCOUNT_TYPE_ID: ownerType.ID }
      ]
    },
  });

  await prisma.$disconnect()

  const dataRole = await JSON.parse(JSON.stringify(res))

  if (!dataRole) {
    return { redirect: { destination: '/' } }
  }

  let result
  let resultChecked
  try {

    const response = await prisma.mENU.findMany({
      where: { RESTAURANT_ID: parseInt(context.params.restaurantId), IS_ACTIVE: true },
      orderBy: [{ ID: "asc" }],
    });

    await prisma.$disconnect()

    result = JSON.parse(JSON.stringify(response))

    const responseChecked = await prisma.bOOKING_PACKAGE_SET.findMany({
      where: { BOOKING_PACKAGE_ID: parseInt(context.params.id), IS_ACTIVE: true },
      orderBy: [{ ID: "asc" }],
    });
    await prisma.$disconnect()


    resultChecked = JSON.parse(JSON.stringify(responseChecked))
  } catch (error) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
  }


  return { props: { listMenu: result, listMenuChecked: resultChecked, bookingPackageId: parseInt(context.params.id) } };
}

export function Menu({ listMenu, listMenuChecked, bookingPackageId }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full h-screen">
          <CardListMenuForPackage listMenu={listMenu} listMenuChecked={listMenuChecked} bookingPackageId={bookingPackageId} />
        </div>
      </div>
    </>
  );
}

Menu.layout = Admin

export default Menu;