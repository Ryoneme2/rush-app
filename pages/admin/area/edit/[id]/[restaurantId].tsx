import React from "react";

// components
import CardEditArea from "components/Cards/CardEditArea";
// layout for page

import BackOffice from "layouts/BackOffice";
import Admin from "layouts/Admin";


import { getSession } from "next-auth/react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken"
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
  try {
    const response = await prisma.aREA.findFirst({
      where: { ID: parseInt(context.params.id) },
    });

    await prisma.$disconnect()
    result = JSON.parse(JSON.stringify(response))
  } catch (error) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
  }

  return { props: { areaData: result, restaurantId: context.params.restaurantId } };
}

export default function AreaEdit({ areaData, restaurantId }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full">
          <CardEditArea Data={areaData} restaurantId={restaurantId} />
        </div>
        {/* <div className="w-full lg:w-4/12 px-4">
          <CardProfile />
        </div> */}
      </div>
    </>
  );
}

AreaEdit.layout = Admin;
