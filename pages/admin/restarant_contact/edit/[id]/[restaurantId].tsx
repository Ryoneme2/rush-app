import React from 'react';

// components
import CardEditArea from 'components/Cards/CardEditArea';
// layout for page

import Admin from 'layouts/Admin';
import CardEditRestaurantContact from 'components/Cards/CardEditRestaurantContact';

import { getSession } from 'next-auth/react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
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

  let result;
  let resultContactProvider;
  try {
    const response = await prisma.rESTAURANT_CONTACT.findFirst({
      where: {
        ID: parseInt(context.params.id),
      },
    });
    await prisma.$disconnect();

    result = JSON.parse(JSON.stringify(response));

    const responseContactProvider = await prisma.cONTACT_PROVIDER.findMany({
      where: { IS_ACTIVE: true },
      orderBy: [{ ID: 'asc' }],
    });
    await prisma.$disconnect();

    resultContactProvider = JSON.parse(JSON.stringify(responseContactProvider));
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
      restaurantContact: result,
      restaurantId: context.params.restaurantId,
      dropdown: resultContactProvider,
    },
  };
}

export default function AreaEdit({
  restaurantContact,
  restaurantId,
  contactProvider,
  dropdown,
}) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <CardEditRestaurantContact
            Data={restaurantContact}
            restaurantId={restaurantId}
            contactProvider={contactProvider}
            dropDownList={dropdown}
          />
        </div>
      </div>
    </>
  );
}

AreaEdit.layout = Admin;
