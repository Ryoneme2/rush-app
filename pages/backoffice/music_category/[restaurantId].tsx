import React, { useContext } from 'react';

// components
import CardListPackage from 'components/Cards/CardListPackage';

// layout for page

import { GetStaticProps } from 'next';
import CardListMusicCategory from 'components/Cards/CardListMusicCategory';
import BackOffice from 'layouts/BackOffice';

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
      ID: +user.id,
      ACCOUNT_TYPE_ID: accountTypeId.ID,
    },
  });

  await prisma.$disconnect();

  const dataRole = await JSON.parse(JSON.stringify(res));

  if (!dataRole) {
    return { redirect: { destination: '/' } };
  }

  const response = await prisma.rESTAURANT_MUSIC_STYLE.findMany({
    where: { RESTAURANT_ID: parseInt(context.params.restaurantId) },
    include: { MUSIC_STYLE: true },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();
  const result = await JSON.parse(JSON.stringify(response));

  return {
    props: { MusicList: result, restaurantId: context.params.restaurantId },
  };
}

export function musicList(props) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full h-screen'>
          <CardListMusicCategory
            list={props.MusicList}
            restaurantId={props.restaurantId}
          />
        </div>
      </div>
    </>
  );
}

musicList.layout = BackOffice;

export default musicList;
