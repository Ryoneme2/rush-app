import React from "react";

// components
import CardEditArea from "components/Cards/CardEditArea";
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

  const response = await prisma.aREA.findFirst({
    where: { ID: parseInt(context.params.id) },
  });
  await prisma.$disconnect()

  const result = await JSON.parse(JSON.stringify(response))


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

AreaEdit.layout = BackOffice;
