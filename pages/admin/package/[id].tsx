import React from 'react';

// components
import CardListPackage from 'components/Cards/CardListPackage';

// layout for page

import Admin from 'layouts/Admin';
import { GetStaticProps } from 'next';

import { getSession } from 'next-auth/react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
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

  let result;
  try {
    const response = await prisma.bOOKING_PACKAGE.findMany({
      where: { RESTAURANT_ID: context.params.id, IS_ACTIVE: true },
      orderBy: [{ ID: 'asc' }],
    });
    await prisma.$disconnect();
    result = JSON.parse(JSON.stringify(response));
  } catch (error) {
    result = [];
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: 'Error',
      text: error,
      icon: 'error',
      confirmButtonText: 'close',
    });
  }

  return { props: { packageList: result, restaurantId: context.params.id } };
}

export function Menu({ packageList, restaurantId }) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full h-screen'>
          <CardListPackage list={packageList} restaurantId={restaurantId} />
        </div>
      </div>
    </>
  );
}

Menu.layout = Admin;

export default Menu;
