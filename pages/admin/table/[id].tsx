import React from "react";

// components

// layout for page

import BackOffice from "layouts/BackOffice";
import CardListArea from "components/Cards/CardListArea";
import Admin from "layouts/Admin";
import CardListTable from "components/Cards/CardListTable";


import { getSession } from "next-auth/react";
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

  const dataRole = JSON.parse(JSON.stringify(res))

  if (!dataRole) {
    return { redirect: { destination: '/' } }
  }

  const response = await prisma.tABLE.findMany({
    where: { AREA_ID: parseInt(context.params.id) },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()

  const result = JSON.parse(JSON.stringify(response))

  return { props: { area: result, areaId: context.params.id } };
}

export function Area({ area, areaId }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full h-screen">
          <CardListTable list={area} areaId={areaId} />
        </div>
      </div>
    </>
  );
}

Area.layout = Admin;

export default Area;
