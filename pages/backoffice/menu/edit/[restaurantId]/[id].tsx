import React from 'react';
import CardEditMenu from 'components/Cards/CardEditMenu';
// components

// layout for page

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

  // if (context.params.id != 0) {

  const response = await prisma.mENU.findFirst({
    where: {
      ID: parseInt(context.params.id),
      RESTAURANT_ID: parseInt(context.params.restaurantId),
      IS_ACTIVE: true,
    },
  });
  await prisma.$disconnect();
  const result = await JSON.parse(JSON.stringify(response));

  const responseMenuC = await prisma.mENU_CATEGORIES.findMany({
    where: { IS_ACTIVE: true },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();
  const resultMenuC = await JSON.parse(JSON.stringify(responseMenuC));

  return {
    props: {
      data: result,
      restaurantId: context.params.restaurantId,
      menuC: resultMenuC,
    },
  };
  // }
  // return { props: { data: {} } };
}

export default function MenuEdit({ data, restaurantId, menuC }) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <CardEditMenu
            dataMenu={data}
            restaurantId={restaurantId}
            menuC={menuC}
          />
        </div>
      </div>
    </>
  );
}

MenuEdit.layout = BackOffice;
