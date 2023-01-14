import React from "react";

// components
import CardEditArea from "components/Cards/CardEditArea";
// layout for page


import CardEditRestaurantContact from "components/Cards/CardEditRestaurantContact";


import { getSession } from "next-auth/react";
import BackOffice from "layouts/BackOffice";
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

  const response = await prisma.rESTAURANT_CONTACT.findFirst({
    where: {
      ID: parseInt(context.params.id),
    },

  });
  await prisma.$disconnect()
  const result = await JSON.parse(JSON.stringify(response))

  const responseContactProvider = await prisma.cONTACT_PROVIDER.findMany({
    where: { IS_ACTIVE: true },
    orderBy: [{ ID: "asc" }],
  });
  await prisma.$disconnect()

  const resultContactProvider = await JSON.parse(JSON.stringify(responseContactProvider));

  return { props: { restaurantContact: result, restaurantId: context.params.restaurantId, dropdown: resultContactProvider } };
}

export default function AreaEdit({ restaurantContact, restaurantId, contactProvider, dropdown }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full">
          <CardEditRestaurantContact Data={restaurantContact} restaurantId={restaurantId} contactProvider={contactProvider} dropDownList={dropdown} />
        </div>
      </div>
    </>
  );
}

AreaEdit.layout = BackOffice;
