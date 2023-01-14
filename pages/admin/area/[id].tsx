import React from "react";

// components

// layout for page

import BackOffice from "layouts/BackOffice";
import CardListArea from "components/Cards/CardListArea";
import Admin from "layouts/Admin";


import { getSession } from "next-auth/react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { verify } from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";

export async function getServerSideProps(context) {
  const session = await getSession(context)
  const prisma = new PrismaClient();
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

  let response
  let result
  try {

    const response = await prisma.aREA.findMany({
      where: { RESTAURANT_ID: parseInt(context.params.id) },
      orderBy: [{ ID: "asc" }],
    });

    await prisma.$disconnect()
    result = JSON.parse(JSON.stringify(response))
  } catch (error) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
  }

  return { props: { area: result, restaurantId: context.params.id } };
}

export function Area({ area, restaurantId }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full h-screen">
          <CardListArea list={area} restaurantId={restaurantId} />
        </div>
      </div>
    </>
  );
}

Area.layout = Admin;

export default Area;
