import React from 'react';

// components

import CardSettings from 'components/Cards/CardEditStore';
import CardProfile from 'components/Cards/CardProfile';

// layout for page

import CardEditStore from 'components/Cards/CardEditStore';

import { getSession } from 'next-auth/react';
import BackOffice from 'layouts/BackOffice';
import { verify } from 'jsonwebtoken';
import {
  PrismaClient,
  RESTAURANT,
  RESTAURANT_CATEGORIES,
} from '@prisma/client';
import { Session } from 'next-auth';

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const session = (await getSession(context)) as Session & {
    tokenUser: string;
    fname: string;
    lname: string;
  };

  if (!session) {
    return { redirect: { destination: '/auth/backoffice' } };
  }

  const secretKey: string = process.env.JWT_SECRET;
  const user = verify(session.tokenUser, secretKey);
  const accountTypeId = await prisma.aCCOUNT_TYPE.findFirst({
    where: { NAME: process.env.TYPE_ADMIN_NAME },
  });
  await prisma.$disconnect();

  // เลือกทุก property
  const res = await prisma.aCCOUNT_PROFILE.findFirst({
    where: {
      ID: parseInt(user.ID),
      ACCOUNT_TYPE_ID: accountTypeId.ID,
    },
  });

  await prisma.$disconnect();

  const dataRole = await JSON.parse(JSON.stringify(res));

  if (!dataRole) {
    return { redirect: { destination: '/' } };
  }

  const response = await prisma.rESTAURANT.findFirst({
    where: { ID: parseInt(context.params.id) },
    include: {
      RESTAURANT_CATEGORIES: true,
    },
  });
  await prisma.$disconnect();
  const result = await JSON.parse(JSON.stringify(response));

  const restaurantCategory = await prisma.rESTAURANT_CATEGORIES.findMany({
    where: { IS_ACTIVE: true },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();
  const data = await JSON.parse(JSON.stringify(restaurantCategory));

  return { props: { restaurantData: result, restaurantCategory: data } };
}

export default function StoreEdit({
  restaurantData,
  restaurantCategory,
}: {
  restaurantData: RESTAURANT & {
    RESTAURANT_CATEGORIES: RESTAURANT_CATEGORIES;
  };
  restaurantCategory: RESTAURANT_CATEGORIES[];
}) {
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

StoreEdit.layout = BackOffice;
