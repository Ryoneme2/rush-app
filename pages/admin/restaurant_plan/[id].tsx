import React from 'react';

// components

import CardSettings from 'components/Cards/CardEditStore';
import CardProfile from 'components/Cards/CardProfile';
import CardListRestaurantPlan from 'components/Cards/CardListRestaurantPlan';
// layout for page

import Admin from 'layouts/Admin';
import { GetStaticProps } from 'next';

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

  const response = await prisma.rESTAURANT_PLAN.findMany({
    where: {
      RESTAURANT_ID: parseInt(context.params.id),
      IS_ACTIVE: true,
    },
  });
  await prisma.$disconnect();

  const result = JSON.parse(JSON.stringify(response));

  return { props: { menuList: result, restaurantId: context.params.id } };
}

export function Settings({ menuList, restaurantId }) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full h-screen'>
          <CardListRestaurantPlan list={menuList} restaurantId={restaurantId} />
        </div>
      </div>
    </>
  );
}

Settings.layout = Admin;

export default Settings;
