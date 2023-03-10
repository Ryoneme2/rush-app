import React from 'react';

// components
import CardEditMusicStyle from 'components/BackOffice/Cards/CardEditRestaurantCategories';
import CardEditContactProvider from 'components/BackOffice/Cards/CardEditContactProvider';
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

  const response = await prisma.cONTACT_PROVIDER.findFirst({
    where: { ID: parseInt(context.params.id) },
  });
  await prisma.$disconnect();

  const result = await JSON.parse(JSON.stringify(response));

  return { props: { ContactProviderData: result } };
}

export default function RestaurantCategoriesEdit({ ContactProviderData }) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <CardEditContactProvider Data={ContactProviderData} />
        </div>
        {/* <div className="w-full lg:w-4/12 px-4">
          <CardProfile />
        </div> */}
      </div>
    </>
  );
}

RestaurantCategoriesEdit.layout = BackOffice;
