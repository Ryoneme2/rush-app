import React from 'react';
import CardEditMenu from 'components/Cards/CardEditMenu';
// components

// layout for page

import Admin from 'layouts/Admin';
import { useRouter } from 'next/router';
import CardListMenuForPackage from 'components/Cards/CardListMenuForPackage';

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

  let result;
  let resultMenuC;
  try {
    const response = await prisma.mENU.findFirst({
      where: {
        ID: parseInt(context.params.id),
        RESTAURANT_ID: parseInt(context.params.restaurantId),
        IS_ACTIVE: true,
      },
    });

    await prisma.$disconnect();

    result = JSON.parse(JSON.stringify(response));

    const responseMenuC = await prisma.mENU_CATEGORIES.findMany({
      orderBy: [{ ID: 'asc' }],
    });
    await prisma.$disconnect();

    resultMenuC = JSON.parse(JSON.stringify(responseMenuC));
  } catch (error) {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: 'Error',
      text: error,
      icon: 'error',
      confirmButtonText: 'close',
    });
  }

  return {
    props: {
      data: result,
      restaurantId: context.params.restaurantId,
      menuC: resultMenuC,
    },
  };
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

MenuEdit.layout = Admin;
