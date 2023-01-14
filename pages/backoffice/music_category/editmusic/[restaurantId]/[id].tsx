import React from 'react';

// components

import CardSettings from 'components/Cards/CardEditStore';
import CardProfile from 'components/Cards/CardProfile';

// layout for page

import Admin from 'layouts/Admin';
import CardEditMusicCategory from 'components/Cards/CardEditMusicCategory';

import { getSession } from 'next-auth/react';
import BackOffice from 'layouts/BackOffice';
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

  const response = await prisma.rESTAURANT_MUSIC_STYLE.findFirst({
    where: {
      RESTAURANT_ID: parseInt(context.params.restaurantId),
      ID: parseInt(context.params.id),
    },
    include: {
      MUSIC_STYLE: true,
    },
  });
  await prisma.$disconnect();
  const result = await JSON.parse(JSON.stringify(response));
  // //

  const response2 = await prisma.mUSIC_STYLE.findMany({
    where: { IS_ACTIVE: true },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();
  const result2 = await JSON.parse(JSON.stringify(response2));
  // //

  return {
    props: {
      restaurantData: result,
      musicData: result2,
      restaurantId: context.params.restaurantId,
    },
  };
}

export default function musicCategory({
  restaurantData,
  musicData,
  restaurantId,
}) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <CardEditMusicCategory
            restaurantData={restaurantData}
            musicData={musicData}
            restaurantId={restaurantId}
          />
        </div>
      </div>
    </>
  );
}

musicCategory.layout = BackOffice;
