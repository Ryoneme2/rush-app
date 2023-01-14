import React, { useState } from 'react';
import DatePicker from 'sassy-datepicker';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
// components
import CardListPackage from 'components/Cards/CardListPackage';

// layout for page

import CardListApproveBooking from 'components/Cards/CardListApproveBooking';
import { useForm } from 'react-hook-form';

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
  let lte = new Date(new Date().setHours(0, 0, 0, 0));

  let responseBooking = await prisma.bOOKING.findMany({
    where: {
      RESTAURANT_ID: parseInt(context.params.id),
      BOOK_DATETIME: {
        // gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(lte.setDate(lte.getDate() + 1))
        gte: new Date(
          new Date(new Date().setUTCHours(17, 0, 0, 0)).setUTCDate(
            new Date().getUTCDate() - 1
          )
        ),
        lt: new Date(
          new Date(new Date().setUTCHours(17, 0, 0, 0)).setUTCDate(
            new Date().getUTCDate()
          )
        ),
      },
    },
    orderBy: [{ ID: 'asc' }],
    include: { BOOKING_PACKAGE_SELECT: true, BOOKING_TABLES: true },
  });
  await prisma.$disconnect();

  let responsePackage = await Promise.all(
    responseBooking.map(
      async (data) =>
        await Promise.all(
          data.BOOKING_PACKAGE_SELECT.map(
            async (data) =>
              await prisma.bOOKING_PACKAGE.findFirst({
                where: { ID: data.BOOKING_PACKAGE_ID },
              })
          )
        )
    )
  );

  let responseTable = await Promise.all(
    responseBooking.map(
      async (data) =>
        await Promise.all(
          data.BOOKING_TABLES.map(
            async (data) =>
              await prisma.tABLE.findFirst({ where: { ID: data.TABLE_ID } })
          )
        )
    )
  );

  let responseAccount = await Promise.all(
    responseBooking.map(
      async (data) =>
        await prisma.aCCOUNT_PROFILE.findFirst({
          where: { ID: data.CUSTOMER_ID },
        })
    )
  );
  await prisma.$disconnect();
  let response = responseBooking.map((data, index) => {
    delete data.BOOKING_PACKAGE_SELECT;
    delete data.BOOKING_TABLES;
    return {
      BOOKING: data,
      ID: data.ID,
      IS_ACTIVE: data.IS_ACTIVE,
      IS_APPROVE: data.IS_APPROVE,
      STATUS: data.STATUS,
      PACKAGE: responsePackage[index],
      TABLE: responseTable[index],
      ACCOUNT: responseAccount[index],
    };
  });

  await prisma.$disconnect();
  const result = await JSON.parse(JSON.stringify(response));

  return { props: { bookingList: result, restaurantId: context.params.id } };
}

export function Settings({ bookingList, restaurantId }) {
  const [datepickerInput, setDatepickerInput] = useState(
    // new Date(new Date().setHours(0, 0, 0, 0))
    new Date(
      new Date(new Date().setUTCHours(17, 0, 0, 0)).setUTCDate(
        new Date().getUTCDate() - 1
      )
    )
  );
  const [bookL, setBookL] = useState(bookingList);

  const [filter, setFilter] = useState('All');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  // setBookL(bookingList);

  const onSubmit = async (data) => {
    let endDate = new Date(datepickerInput);
    const endpoint = `/api/booking/findmany`;

    let JSONdata = JSON.stringify({
      restaurantId: parseInt(restaurantId),
      dateGte: new Date(datepickerInput),
      dateLte: new Date(endDate.setDate(endDate.getDate() + 1)),
      status: data.status,
    });

    const options = {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    };

    const response = await fetch(endpoint, options);

    const result = await response.json();
    setBookL(result);
    setFilter(data.status);

    // bookingList = result;
  };

  // onSubmit("a");
  return (
    <>
      <form
        id='restaurantForm'
        name='restaurantForm'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-8 shadow-lg'>
          <div className='flex-auto p-4'>
            <div className='flex flex-wrap'>
              <div className='relative w-full pr-4 max-w-full flex-grow flex-1'>
                <div className='flex flex-row justify-between'>
                  <div className='flex flex-row space-x-1'>
                    <div className='flex flex-col justify-end'>
                      <label className='text-sm'>วันที่</label>
                      <Menu
                        menuButton={
                          <MenuButton className=''>
                            <div className=' shadow-md xl:mb-0 h-10 flex flex-row border-1 text-left'>
                              <i className='far fa-calendar mx-4 my-auto'></i>
                              <div className='px-2 items-center self-center'>
                                <div className='self-center'>
                                  <p className='text-sm font-bold'>
                                    {datepickerInput.getDate().toString()}/
                                    {(
                                      datepickerInput.getMonth() + 1
                                    ).toString()}
                                    /{datepickerInput.getFullYear().toString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </MenuButton>
                        }
                      >
                        <MenuItem
                          onClick={(e) => {
                            e.keepOpen = true;
                          }}
                        >
                          <div
                            className=' z-2 bg-light shadow-md rounded-lg   z-index: 1
    position: absolute'
                          >
                            <DatePicker
                              onChange={(date) => {
                                setDatepickerInput(date);
                              }}
                              selected={datepickerInput}
                            />
                          </div>
                        </MenuItem>
                      </Menu>
                    </div>

                    <div className='flex flex-col'>
                      <label>ตัวกรอกสถานะ</label>
                      <select
                        {...register('status')}
                        defaultValue={filter}
                        className={'h-10 '}
                      >
                        <option value='All'>All</option>
                        <option value='Pending'>Pending</option>
                        <option value='Confirm'>Confirm</option>
                        <option value='Reject'>Reject</option>
                        <option value='Refund'>Refund</option>
                        <option value='Cancel'>Cancel</option>
                      </select>
                    </div>
                  </div>

                  <div className='self-center'>
                    <button
                      className=' bg-blueGray-700 active:bg-blueGray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150'
                      type='submit'
                    >
                      ค้นหา
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className='flex flex-wrap'>
        <div className='w-full h-screen'>
          <div>
            <CardListApproveBooking
              list={bookL}
              setList={onSubmit}
              restaurantId={restaurantId}
              refresh={onSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}

Settings.layout = BackOffice;

export default Settings;
