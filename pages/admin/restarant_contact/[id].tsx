// const [contactProvider, setContactProvider] = useState([]);
import React from "react";

// components

// layout for page

import CardListRestarantContact from "components/Cards/CardListRestarantContact";
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


  let response
  let result
  try {
    const restaurantContact = await prisma.rESTAURANT_CONTACT.findMany({
      where: {
        RESTAURANT_ID: parseInt(context.params.id),
      }, include: { CONTACT_PROVIDER: true }
    });
    await prisma.$disconnect();

    result = JSON.parse(JSON.stringify(restaurantContact))
  } catch (error) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
  }

  return { props: { contactList: result, restaurantId: context.params.id } };
}

export function Area({ contactList, restaurantId, contactProviderList }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full h-screen">
          <CardListRestarantContact list={contactList} restaurantId={restaurantId} contactProviderList={contactProviderList} />
        </div>
      </div>
    </>
  );
}

Area.layout = Admin;

export default Area;