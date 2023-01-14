import React from "react";

// components
import CardEditArea from "components/Cards/CardEditArea";
// layout for page

import BackOffice from "layouts/BackOffice";
import Admin from "layouts/Admin";
import CardEditTable from "components/Cards/CardEditTable";


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

  const table = await prisma.tABLE.findFirst({
    where: { ID: parseInt(context.params.id) },
  });

  await prisma.$disconnect()
  const result = JSON.parse(JSON.stringify(table))


  return { props: { areaData: result, areaId: context.params.areaId } };
}

export default function TableEdit({ areaData, areaId }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full">
          <CardEditTable Data={areaData} areaId={areaId} />
        </div>
        {/* <div className="w-full lg:w-4/12 px-4">
          <CardProfile />
        </div> */}
      </div>
    </>
  );
}

TableEdit.layout = Admin;
