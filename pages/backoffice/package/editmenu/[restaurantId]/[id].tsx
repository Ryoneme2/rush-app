import CardListMenuForPackage from 'components/Cards/CardListMenuForPackage';
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
      ID: parseInt(user.ID),
      ACCOUNT_TYPE_ID: accountTypeId.ID,
    },
  });

  await prisma.$disconnect();

  const dataRole = await JSON.parse(JSON.stringify(res));

  if (!dataRole) {
    return { redirect: { destination: '/' } };
  }

  const response = await prisma.mENU.findMany({
    where: {
      RESTAURANT_ID: parseInt(context.params.restaurantId),
      IS_ACTIVE: true,
    },
    orderBy: [{ ID: 'asc' }],
  });

  await prisma.$disconnect();

  const result = JSON.parse(JSON.stringify(response));

  const responseChecked = await prisma.bOOKING_PACKAGE_SET.findMany({
    where: { BOOKING_PACKAGE_ID: parseInt(context.params.id), IS_ACTIVE: true },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();
  const resultChecked = await JSON.parse(JSON.stringify(responseChecked));

  return {
    props: {
      listMenu: result,
      listMenuChecked: resultChecked,
      bookingPackageId: parseInt(context.params.id),
    },
  };
}

export function Menu({ listMenu, listMenuChecked, bookingPackageId }) {
  return (
    <>
      <div className='flex flex-wrap'>
        <div className='w-full h-screen'>
          <CardListMenuForPackage
            listMenu={listMenu}
            listMenuChecked={listMenuChecked}
            bookingPackageId={bookingPackageId}
          />
        </div>
      </div>
    </>
  );
}

Menu.layout = BackOffice;

export default Menu;
