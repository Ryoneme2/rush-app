import React from "react";

// components

import CardListPermission from "components/BackOffice/Cards/CardListPermission";

// layout for page

import BackOffice from "layouts/BackOffice";


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



  const response = await prisma.pERMISSION.findMany({
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()
  const result = await JSON.parse(JSON.stringify(response));

  return { props: { Permission: result } };
}

export function Permission({ Permission }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full h-screen">
          <CardListPermission list={Permission} />
        </div>
      </div>
    </>
  );
}

Permission.layout = BackOffice;

export default Permission;
