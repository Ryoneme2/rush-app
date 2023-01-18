import React, { useState } from 'react';
import CardEditPackage from 'components/Cards/CardEditPackage';
// components

// layout for page

import CardListMenuForPackage from 'components/Cards/CardListMenuForPackage';

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
      ID: +user.id,
      ACCOUNT_TYPE_ID: accountTypeId.ID,
    },
  });

  await prisma.$disconnect();

  const dataRole = await JSON.parse(JSON.stringify(res));

  if (!dataRole) {
    return { redirect: { destination: '/' } };
  }

  if (context.params.id != 0) {
    const response = await prisma.bOOKING_PACKAGE.findFirst({
      where: {
        ID: parseInt(context.params.id),
        RESTAURANT_ID: parseInt(context.params.restaurantid),
      },
    });
    await prisma.$disconnect();
    const result = await JSON.parse(JSON.stringify(response));

    return {
      props: { data: result, restaurantId: context.params.restaurantid },
    };
  }

  return { props: { data: null, restaurantId: context.params.restaurantid } };
}

export default function PackageEdit({ data, restaurantId }) {
  const [checkedIds, setChekedIds] = useState([]);

  const handlechange = (e, value) => {
    const clickedId = e.target.value;
    // {id:e.target.value,value:value};

    if (checkedIds.includes(clickedId)) {
      setChekedIds(checkedIds.filter((data) => data.id !== clickedId.id));
    } else {
      setChekedIds([...checkedIds, clickedId]);
    }
  };

  const isCheked = (id, value) => {
    checkedIds.includes({ id: id, value: value });
  };

  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full'>
          <CardEditPackage dataPackage={data} restaurantId={restaurantId} />
        </div>
      </div>
    </>
  );
}

PackageEdit.layout = BackOffice;
