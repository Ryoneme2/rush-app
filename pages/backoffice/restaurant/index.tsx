import React, { useContext } from 'react';

// components
import CardListPackage from 'components/Cards/CardListPackage';

// layout for page

import { GetStaticProps } from 'next';
import CardListStore from 'components/Cards/CardListStore';

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

  console.log({ session });

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

  const response = await prisma.rESTAURANT_MEMBERS.findMany({
    where: { IS_ACTIVE: true, RESTAURANT: { IS_ACTIVE: true } },
    include: {
      RESTAURANT: true,
    },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();

  const result = await JSON.parse(JSON.stringify(response));

  return { props: { StoreList: result } };
}

export function Settings(props) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full h-screen'>
          <CardListStore list={props.StoreList} />
        </div>
      </div>
    </>
  );
}

Settings.layout = BackOffice;

export default Settings;
