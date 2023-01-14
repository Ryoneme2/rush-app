import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Fragment, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
// components

export default function MobileNavbar() {
  const router = useRouter();

  const { data: session } = useSession() as {
    data: Session & {
      tokenUser: string;
    };
  };

  const btnStyle = 'flex flex-col justify-center items-center';
  const disableBtnStyle =
    'flex flex-col justify-center items-center opacity-60 cursor-not-allowed';

  return (
    <>
      <nav className='bottom-0 z-2 fixed w-full flex lg:hidden items-center '>
        <div className='grid grid-cols-3 gap-0 justify-between w-full py-2 bg-white border text-center text-md'>
          <button
            className={btnStyle}
            onClick={() => {
              router.push({
                pathname: '/',
              });
            }}
          >
            <i className='fas fa-home'></i>
            <p>Home</p>
          </button>
          <button
            className={session ? btnStyle : disableBtnStyle}
            disabled={!session ? true : false}
            onClick={() => {
              router.push({
                pathname: '/myBooking/',
              });
            }}
          >
            <i className='far fa-calendar-check'></i>
            <p>Booking</p>
          </button>
          <button
            className={btnStyle}
            onClick={() => {
              router.push({
                pathname: '/mobile/',
              });
            }}
          >
            <i className='far fa-user-circle'></i>
            <p>Profile</p>
          </button>
        </div>
      </nav>
    </>
  );
}
