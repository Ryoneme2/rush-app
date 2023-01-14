/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
// import Link from "next/link";
// import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css';

import Default from 'layouts/Default';
import { useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import AccountLayout from 'layouts/Account';
import { Session } from 'next-auth';

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  // http://localhost:3000/api/action/information/findone
  const session = (await getSession(context)) as Session & {
    tokenUser: string;
    fname: string;
    lname: string;
  };
  // Fetch data from external API
  if (!session) {
    return { redirect: { destination: '/' } };
  }

  const secretKey: string = process.env.JWT_SECRET;
  const user = verify(session.tokenUser, secretKey);
  // console.log('session',user);

  const res = await prisma.aCCOUNT_PROFILE.findFirst({
    where: { ID: parseInt(user.ID) },
    include: { ACCOUNT_INTERNAL: true },
  });
  await prisma.$disconnect();
  const data = await JSON.parse(JSON.stringify(res));
  // const data = {firstName:'',ACCOUNT_INTERNAL:[{email:''}]}

  return {
    props: { userData: data }, // will be passed to the page component as props
  };
}

function GetDate() {
  let items = [];

  for (var i = 1; i <= 31; i++) {
    items.push(<option value={i}>{i}</option>);
  }
  return items;
}

function GetMonths() {
  let items = [];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  for (var i = 0; i < months.length; i++) {
    items.push(<option value={months[i]}>{months[i]}</option>);
  }
  return items;
}

function GetYear() {
  let items = [];

  const currentDate = new Date().getFullYear() - 20;

  for (var i = 1950; i <= currentDate; i++) {
    items.push(<option value={i}>{i}</option>);
  }
  return items;
}

function Account(userData) {
  const MySwal = withReactContent(Swal);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  }) as {
    data: Session & {
      tokenUser: string;
    };
  };

  const [menu, setMenu] = useState('info');
  const [userFullname, setUserFullname] = useState('');

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showNewConPass, setShowNewConPass] = useState(false);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const activeBTN = 'text-primary underline-thickness underline-offset-4';

  async function changeInfo(changeData) {
    let date = new Date(
      changeData.date + '-' + changeData.month + '-' + changeData.year
    );

    try {
      const res = await fetch(`/api/action/information/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.tokenUser,
        },
        body: JSON.stringify({
          firstName: changeData.firstName,
          lastName: changeData.lastName,
          birthDate: date,
          email: changeData.email,
          phone: changeData.phone,
        }),
      });
      const resp = await res.json();
      // console.log(resp);

      if (res.status == 200) {
        MySwal.fire({
          title: 'เรียบร้อย',
          text: 'ข้อมูลของท่านถูกเปลี่ยนแปลงแล้ว',
          icon: 'success',
          confirmButtonText: 'ok',
          preConfirm() {
            localStorage.setItem('fname', resp.FIRST_NAME);
            localStorage.setItem('lname', resp.LAST_NAME);
            // session.fname = resp.FIRST_NAME;
            // session.lname = resp.LAST_NAME;
            router.reload();
          },
        });
      }

      if (res.status == 400) {
        MySwal.fire({
          title: 'Error',
          text: 'เกิดความผิดพลาดในกา่รเปลี่ยนแปลงข้อมูลของท่าน Code:400',
          icon: 'error',
          confirmButtonText: 'ok',
        });
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonText: 'close',
      });
    }
  }

  async function changePassword(changePassData) {
    if (
      changePassData.oldPass == '' ||
      changePassData.newPass == '' ||
      changePassData.ConfirmPass == ''
    ) {
      return;
    }

    if (changePassData.newPass != changePassData.ConfirmPass) {
      MySwal.fire({
        title: 'Error',
        text: 'โปรดกรอกรหัสผ่านใหม่ให้เหมือนกัน',
        icon: 'error',
        confirmButtonText: 'ok',
      });
      return;
    }

    try {
      const res = await fetch(`/api/action/register/changepassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.tokenUser,
        },
        body: JSON.stringify({
          oldPassword: changePassData.oldPass,
          newPassword: changePassData.newPass,
        }),
      });
      if (res.status == 200) {
        MySwal.fire({
          title: 'Success',
          text: 'รหัสผ่านของท่านถูกเปลี่ยนแปลงแล้ว',
          icon: 'success',
          confirmButtonText: 'ok',
          preConfirm() {
            reset();
          },
        });
      }

      if (res.status == 400) {
        MySwal.fire({
          title: 'Error',
          text: 'เกิดข้อผิดพลาดในการเปลี่ยนแปลงรหัสผ่าน Code:400',
          icon: 'error',
          confirmButtonText: 'ok',
        });
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonText: 'close',
      });
    }
  }

  return (
    <div className='container mx-auto flex flex-col'>
      <div className='mt-12 account-padding'>
        <div>
          <h1 className='font-bold text-2xl mb-10'>Account Setting</h1>
        </div>
        <div className='flex flex-row space-x-12 font-bold mb-12'>
          <button
            className={menu == 'info' ? activeBTN : null}
            onClick={() => {
              setMenu('info');
            }}
          >
            Personal infomation
          </button>
          <button
            className={menu == 'password' ? activeBTN : null}
            onClick={() => {
              setMenu('password');
            }}
          >
            Change password
          </button>
        </div>
      </div>
      {menu == 'info' && (
        <div className='mb-16'>
          <div className='hidden lg:block border border-black rounded-md shadow-md p-6 xs:w-11/12 lg:w-5/12 xs:mx-auto mb-28 lg:mx-0 lg:mb-0'>
            <h2 className='text-xl font-bold mb-8'>Personal infomation</h2>
            <form action='' onSubmit={handleSubmit(changeInfo)}>
              <div className='flex flex-col mb-6'>
                <div className='mb-2'>
                  <span>First name</span>
                  <span className='text-red-500'>*</span>
                </div>
                <input
                  type='text'
                  className='rounded-md'
                  {...register('firstName')}
                  defaultValue={userData.userData.FIRST_NAME ?? ''}
                  required
                />
              </div>
              <div className='flex flex-col mb-6'>
                <div>
                  <span>Last name</span>
                  <span className='text-red-500'>*</span>
                </div>
                <input
                  type='text'
                  className='rounded-md mb-2'
                  {...register('lastName')}
                  defaultValue={userData.userData.LAST_NAME ?? ''}
                  required
                />
                <p className='text-sm'>
                  Make sure your first and last name matches on your government
                  ID.
                </p>
              </div>
              <div className='flex flex-col mb-6'>
                <label htmlFor=''>
                  Date of birth<span className='text-red-600'>*</span>{' '}
                </label>
                <div className='flex flex-row w-full mb-2'>
                  <select
                    className='flex-1  rounded-md'
                    {...register('date')}
                    value={Number(
                      new Date(userData.userData.BIRTH_DATE).getDate()
                    )}
                    required
                  >
                    {GetDate()}
                  </select>
                  <select
                    className='flex-1 mx-1 rounded-md'
                    {...register('month')}
                    value={
                      months[
                        Number(
                          new Date(userData.userData.BIRTH_DATE).getMonth()
                        )
                      ]
                    }
                    required
                  >
                    {GetMonths()}
                  </select>
                  <select
                    className='flex-1  rounded-md'
                    {...register('year')}
                    value={Number(
                      new Date(userData.userData.BIRTH_DATE).getFullYear()
                    )}
                    required
                  >
                    {' '}
                    {GetYear()}
                  </select>
                </div>
                <p className='text-sm'>
                  You must be at least 20 years old because your government ID
                  must be checked before entering the service.
                </p>
              </div>
              <div className='flex flex-col mb-6'>
                <div>
                  <span>Email</span>
                  <span className='text-red-500'>*</span>
                </div>
                <input
                  type='text'
                  className='rounded-md'
                  {...register('email')}
                  defaultValue={
                    userData.userData.ACCOUNT_INTERNAL[0].EMAIL ?? ''
                  }
                  required
                />
              </div>
              <div className='flex flex-col mb-12'>
                <div>
                  <span>Phone number</span>
                </div>

                <input
                  type='text'
                  className='rounded-md'
                  {...register('phone')}
                  defaultValue={userData.userData.PHONE ?? ''}
                />
              </div>

              <div className='flex flex-col mb-6'>
                <button
                  type='submit'
                  className='bg-primary font-bold text-white text-center p-2 rounded-md'
                >
                  Save
                </button>
              </div>
            </form>
          </div>

          <div className='block lg:hidden border-none border-black rounded-md px-6 mb-28 lg:mx-0 lg:mb-0'>
            <h2 className='text-xl font-bold mb-8'>Personal infomation</h2>
            <form action='' onSubmit={handleSubmit(changeInfo)}>
              <div className='flex flex-col mb-6'>
                <div className='mb-2'>
                  <span>First name</span>
                  <span className='text-red-500'>*</span>
                </div>
                <input
                  type='text'
                  className='rounded-md'
                  {...register('firstName')}
                  defaultValue={userData.userData.FIRST_NAME ?? ''}
                  required
                />
              </div>
              <div className='flex flex-col mb-6'>
                <div>
                  <span>Last name</span>
                  <span className='text-red-500'>*</span>
                </div>
                <input
                  type='text'
                  className='rounded-md mb-2'
                  {...register('lastName')}
                  defaultValue={userData.userData.LAST_NAME ?? ''}
                  required
                />
                <p className='text-sm'>
                  Make sure your first and last name matches on your government
                  ID.
                </p>
              </div>
              <div className='flex flex-col mb-6'>
                <label htmlFor=''>
                  Date of birth<span className='text-red-600'>*</span>{' '}
                </label>
                <div className='flex flex-row w-full mb-2'>
                  <select
                    className='flex-1  rounded-md'
                    {...register('date')}
                    value={Number(
                      new Date(userData.userData.BIRTH_DATE).getDate()
                    )}
                    required
                  >
                    {GetDate()}
                  </select>
                  <select
                    className='flex-1 mx-1 rounded-md'
                    {...register('month')}
                    value={
                      months[
                        Number(
                          new Date(userData.userData.BIRTH_DATE).getMonth()
                        )
                      ]
                    }
                    required
                  >
                    {GetMonths()}
                  </select>
                  <select
                    className='flex-1  rounded-md'
                    {...register('year')}
                    value={Number(
                      new Date(userData.userData.BIRTH_DATE).getFullYear()
                    )}
                    required
                  >
                    {' '}
                    {GetYear()}
                  </select>
                </div>
                <p className='text-sm'>
                  You must be at least 20 years old because your government ID
                  must be checked before entering the service.
                </p>
              </div>
              <div className='flex flex-col mb-6'>
                <div>
                  <span>Email</span>
                  <span className='text-red-500'>*</span>
                </div>
                <input
                  type='text'
                  className='rounded-md'
                  {...register('email')}
                  defaultValue={
                    userData.userData.ACCOUNT_INTERNAL[0].EMAIL ?? ''
                  }
                  required
                />
              </div>
              <div className='flex flex-col mb-12'>
                <div>
                  <span>Phone number</span>
                </div>

                <input
                  type='text'
                  className='rounded-md'
                  {...register('phone')}
                  defaultValue={userData.userData.PHONE ?? ''}
                />
              </div>

              <div className='flex flex-col mb-6'>
                <button
                  type='submit'
                  className='bg-primary font-bold text-white text-center p-2 rounded-md'
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {menu == 'password' && (
        <div>
          <div className='hidden lg:block border border-black rounded-md shadow-md p-8 xs:w-11/12 lg:w-5/12 xs:mx-auto lg:mx-0'>
            <h2 className='text-xl font-bold mb-8'>Change password</h2>
            <div className='flex flex-col mb-8'>
              <div>
                {/* <span>Enter the email address associated with your account, and we'll send you a link to reset your password.</span> */}

                <span>
                  In order to change your password you must enter your old
                  password correctly and then following by new password and
                  repeat the new password in Confirm password session
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit(changePassword)}>
              <div className='flex flex-col space-y-6 mb-12'>
                <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3'>
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    minLength={6}
                    className=' rounded-md w-11/12 border-0'
                    placeholder='Old password'
                    {...register('oldPass')}
                    required
                  />
                  <i
                    className='far fa-eye self-center text-lg cursor-pointer'
                    onClick={() => {
                      setShowOldPass(!showOldPass);
                    }}
                  ></i>
                </div>
                <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3'>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    minLength={6}
                    className=' rounded-md w-11/12 border-0'
                    placeholder='New password'
                    {...register('newPass')}
                    required
                  />
                  <i
                    className='far fa-eye self-center text-lg cursor-pointer'
                    onClick={() => {
                      setShowNewPass(!showNewPass);
                    }}
                  ></i>
                </div>
                <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3'>
                  <input
                    type={showNewConPass ? 'text' : 'password'}
                    minLength={6}
                    className=' rounded-md w-11/12 border-0'
                    placeholder='Confirm password'
                    {...register('ConfirmPass')}
                    required
                  />
                  <i
                    className='far fa-eye self-center text-lg cursor-pointer'
                    onClick={() => {
                      setShowNewConPass(!showNewConPass);
                    }}
                  ></i>
                </div>
              </div>

              <div className='flex flex-col mb-5'>
                <button
                  className='bg-primary font-bold text-white text-center p-2 rounded-md'
                  type='submit'
                >
                  Change password
                </button>
              </div>
            </form>
          </div>

          <div className='block lg:hidden p-6 xs:w-11/12 lg:w-5/12 xs:mx-auto lg:mx-0'>
            <h2 className='text-xl font-bold mb-8'>Change password</h2>
            <div className='flex flex-col mb-8'>
              <div>
                {/* <span>Enter the email address associated with your account, and we'll send you a link to reset your password.</span> */}

                <span>
                  In order to change your password you must enter your old
                  password correctly and then following by new password and
                  repeat the new password in Confirm password session
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit(changePassword)}>
              <div className='flex flex-col space-y-6 mb-6'>
                <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3'>
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    minLength={6}
                    className=' rounded-md w-11/12 border-0'
                    placeholder='Old password'
                    {...register('oldPass')}
                    required
                  />
                  <i
                    className='far fa-eye self-center text-lg cursor-pointer'
                    onClick={() => {
                      setShowOldPass(!showOldPass);
                    }}
                  ></i>
                </div>
                <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3'>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    minLength={6}
                    className=' rounded-md w-11/12 border-0'
                    placeholder='New password'
                    {...register('newPass')}
                    required
                  />
                  <i
                    className='far fa-eye self-center text-lg cursor-pointer'
                    onClick={() => {
                      setShowNewPass(!showNewPass);
                    }}
                  ></i>
                </div>
                <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3'>
                  <input
                    type={showNewConPass ? 'text' : 'password'}
                    minLength={6}
                    className=' rounded-md w-11/12 border-0'
                    placeholder='Confirm password'
                    {...register('ConfirmPass')}
                    required
                  />
                  <i
                    className='far fa-eye self-center text-lg cursor-pointer'
                    onClick={() => {
                      setShowNewConPass(!showNewConPass);
                    }}
                  ></i>
                </div>
              </div>

              <div className='flex flex-col mb-5'>
                <button
                  className='bg-primary font-bold text-white text-center p-2 rounded-md'
                  type='submit'
                >
                  Change password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* <PhoneInput
                            containerClass="border-1 rounded-md"
                            containerStyle={{ "width": "100%", }}
                            inputStyle={{
                                "width": "100%",
                                "fontSize": "1rem",
                                "lineHeight": "1.5rem",
                                "height": "45px",
                                "border": "none",

                            }}

                            inputProps={{
                                enableLongNumbers: true,
                                countryCodeEditable: false,
                                copyNumbersOnly: true,
                            }}

                            masks={{ th: '... ... ....' }}
                            placeholder="please enter phone number"
                            country={'th'}
                            value={phone}
                            onChange={e => {
                                setPhone(e);
                            }}
                        /> */}
    </div>
  );
}

Account.layout = AccountLayout;

export default Account;
