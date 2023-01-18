import React from 'react';

// components

import CardSettings from 'components/Cards/CardEditStore';
import CardProfile from 'components/Cards/CardProfile';

// layout for page

import Admin from 'layouts/Admin';
import CardEditStore from 'components/Cards/CardEditStore';

import { getSession } from 'next-auth/react';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Session } from 'next-auth';
export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const session = (await getSession(context)) as Session & {
    tokenUser: string;
    fname: string;
    lname: string;
  };
  const { id } = context.query;

  if (!session) {
    return { redirect: { destination: '/auth/admin' } };
  }

  const secretKey: string = process.env.JWT_SECRET;
  const user = verify(session.tokenUser, secretKey);
  const adminType = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_ADMIN_NAME },
  });
  await prisma.$disconnect();
  const ownerType = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_OWNER_NAME },
  });
  await prisma.$disconnect();
  // เลือกทุก property
  const res = await prisma.aCCOUNT_PROFILE.findFirst({
    where: {
      ID: +user.id,
      OR: [
        { ACCOUNT_TYPE_ID: adminType.ID },
        { ACCOUNT_TYPE_ID: ownerType.ID },
      ],
    },
  });

  await prisma.$disconnect();

  const dataRole = await JSON.parse(JSON.stringify(res));

  if (!dataRole) {
    return { redirect: { destination: '/' } };
  }

  let result;
  let data;
  try {
    const response = await prisma.rESTAURANT.findFirst({
      where: { ID: parseInt(id) },
      include: {
        RESTAURANT_CATEGORIES: true,
      },
    });

    await prisma.$disconnect();
    result = JSON.parse(JSON.stringify(response));

    const restaurantCate = await prisma.rESTAURANT_CATEGORIES.findMany({
      where: { IS_ACTIVE: true },
      orderBy: [{ ID: 'asc' }],
    });

    await prisma.$disconnect();

    data = JSON.parse(JSON.stringify(restaurantCate));
  } catch (error) {
    console.log(error);
  }

  return { props: { restaurantData: result, restaurantCategory: data } };
}

export default function StoreEdit({ restaurantData, restaurantCategory }) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <CardEditStore
            restaurantData={restaurantData}
            restaurantCategory={restaurantCategory}
          />
        </div>
        {/* <div className="w-full lg:w-4/12 px-4">
          <CardProfile />
        </div> */}
      </div>
    </>
  );
}

StoreEdit.layout = Admin;
