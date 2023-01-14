import React from "react";

// components

import CardSettings from "components/Cards/CardEditStore";
import CardProfile from "components/Cards/CardProfile";

// layout for page

import Admin from "layouts/Admin";
import CardEditMusicCategory from "components/Cards/CardEditMusicCategory";

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
  let result2
  try {

    const response = await prisma.rESTAURANT_MUSIC_STYLE.findFirst({
      where: { RESTAURANT_ID: parseInt(context.params.restaurantId), ID: parseInt(context.params.id) },
      include: {
        MUSIC_STYLE: true,
      },
    });


    await prisma.$disconnect()

    result = JSON.parse(JSON.stringify(response))

    const response2 = await prisma.rESTAURANT_MUSIC_STYLE.findMany({
      where: { RESTAURANT_ID: parseInt(context.params.restaurantId) },
      include: { MUSIC_STYLE: true },
      orderBy: [{ ID: "asc" }],
    });
    await prisma.$disconnect()

    result2 = JSON.parse(JSON.stringify(response2))

  } catch (error) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
  }

  return { props: { restaurantData: result, musicData: result2, restaurantId: context.params.restaurantId } };
}

export default function musicCategory({ restaurantData, musicData, restaurantId }) {

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full">
          <CardEditMusicCategory restaurantData={restaurantData} musicData={musicData} restaurantId={restaurantId} />
        </div>
      </div>
    </>
  );
}

musicCategory.layout = Admin;
