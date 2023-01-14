import React from 'react';
// components

// layout for page

import Admin from 'layouts/Admin';
import { useRouter } from 'next/router';
import CardListMenuForPackage from 'components/Cards/CardListMenuForPackage';
import CardEditRestaurantGallery from 'components/Cards/CardEditRestaurantGallery';

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
      ID: parseInt(user.ID),
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

  const response = await prisma.rESTAURANT_GALLERY.findFirst({
    where: {
      ID: parseInt(context.params.restaurantId) ?? 0,
      IS_ACTIVE: true,
    },
  });
  await prisma.$disconnect();

  const result = JSON.parse(JSON.stringify(response));

  return { props: { data: result, restaurantId: context.params.restaurantId } };
  // }
  // return { props: { data: {} } };
}

export default function MenuEdit({ data, restaurantId, menuC }) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <CardEditRestaurantGallery
            dataMenu={data}
            restaurantId={restaurantId}
            menuC={menuC}
          />
        </div>
      </div>
    </>
  );
}

MenuEdit.layout = Admin;
