import React from "react";

// components

// layout for page

import BackOffice from "layouts/BackOffice";
import CardListRoleManagement from "components/BackOffice/Cards/CardListRoleManagement";

import { getSession } from "next-auth/react";
import { verify } from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const session = await getSession(context)

  if (!session) {
    return { redirect: { destination: '/auth/backoffice' } }
  }

  const secretKey: string = process.env.JWT_SECRET;
  const user = verify(session.tokenUser, secretKey)
  const accountTypeId = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_ADMIN_NAME }
  })
  await prisma.$disconnect()

  // เลือกทุก property
  const res = await prisma.aCCOUNT_PROFILE.findFirst({
    where: {
      ID: parseInt(user.ID),
      ACCOUNT_TYPE_ID: accountTypeId.ID
    },
  });
  await prisma.$disconnect()

  const dataRole = await JSON.parse(JSON.stringify(res))

  if (!dataRole) {
    return { redirect: { destination: '/' } }
  }
  const adminType = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_ADMIN_NAME }
  })
  await prisma.$disconnect()

  const ownerType = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_OWNER_NAME }
  })
  await prisma.$disconnect()

  const response = await prisma.aCCOUNT_PROFILE.findMany({
    where: {
      OR: [
        { ACCOUNT_TYPE_ID: adminType.ID },
        { ACCOUNT_TYPE_ID: ownerType.ID }
      ], IS_ACTIVE: true
    },
    include: { ACCOUNT_INTERNAL: true },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
  const result = await JSON.parse(JSON.stringify(response));

  return { props: { RestaurantCategories: result } };
}

export function MusicStyle({ RestaurantCategories }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full h-screen">
          <CardListRoleManagement list={RestaurantCategories} />
        </div>
      </div>
    </>
  );
}

MusicStyle.layout = BackOffice;

export default MusicStyle;
