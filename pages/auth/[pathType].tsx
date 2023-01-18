import React, { useState } from 'react';
import Link from 'next/link';

// layout for page

import Auth from 'layouts/Auth';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { getProviders } from 'next-auth/react';
import Router from 'next/router';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  const session = (await getSession(context)) as Session & {
    tokenUser: string;
    fname: string;
    lname: string;
  };

  if (session) {
    return {
      redirect: { destination: '/' + context.params.pathType + '/dashboard' },
    };
  }

  return { props: { pathType: context.params.pathType } };
}

import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

export default function Login({ providers, csrfToken, pathType }) {
  const mySwal = withReactContent(Swal);
  const { data: session, status } = useSession() as {
    data: Session & {
      tokenUser: string;
    };
    status: 'authenticated' | 'loading' | 'unauthenticated';
  };
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const [error, setError] = useState(null);
  const [dataRole, setDataRole] = useState(0);

  const onSubmit = async (data) => {
    if (data.email == '' || data.password == '') {
      return;
    }

    const resRole = await fetch(`/api/account_profile/checkrolebyemail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: data.email }),
    });
    const dataRole = await resRole.json();

    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    console.log(res);

    if (res?.error) {
      mySwal.fire({
        title: 'Error',
        text: 'incorrect email or password.',
        icon: 'error',
        cancelButtonText: 'close',
      });
      setError(res.error);
    } else {
      setError(null);
    }

    if (
      (pathType == 'admin' && dataRole.ACCOUNT_TYPE_ID == 2) ||
      dataRole.ACCOUNT_TYPE_ID == 3
    ) {
      console.log('pushing to ' + '/' + pathType + '/dashboard');

      router.push({
        pathname: '/' + pathType + '/dashboard',
      });
    } else if (pathType == 'backoffice' && dataRole.ACCOUNT_TYPE_ID == 3) {
      router.push({
        pathname: '/' + pathType + '/dashboard',
      });
    } else {
      router.push({
        pathname: '/access/deny',
      });
    }
  };

  if (!session) {
    return (
      <>
        <div className='container mx-auto px-4 h-full'>
          <div className='flex content-center items-center justify-center h-full'>
            <div className='w-full lg:w-4/12 px-4'>
              <div className='relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0'>
                <div className='rounded-t mb-0 px-6 py-6'>
                  {/* <div className="text-center mb-3">
                    <h6 className="text-blueGray-500 text-sm font-bold">
                      Sign in with
                    </h6>
                  </div>
                  <div className="btn-wrapper text-center">

                    <button
                      className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => { loginGoogle() }}
                    >
                      <i className="fab fa-google text-lg mx-1"></i>
                      Google
                    </button>
                    <button
                      className="bg-white active:bg-blueGray-50 text-blueGray-700 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => { loginFacebook() }}
                    >
                      <i className="fab fa-facebook text-lg mx-1"></i>
                      Facebook
                    </button>
                  </div> */}
                  {/* <hr className="mt-6 border-b-1 border-blueGray-300" /> */}
                </div>
                <div className='flex-auto px-4 lg:px-10 py-10 pt-0'>
                  <div className='text-black-400 font-bold text-center mb-3'>
                    <h6 className='text-blueGray-500 text-sm font-bold'>
                      Sign in
                    </h6>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='relative w-full mb-3'>
                      <label
                        className='block uppercase text-blueGray-600 text-xs font-bold mb-2'
                        htmlFor='grid-password'
                      >
                        Email
                      </label>
                      <input
                        type='text'
                        className='border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150'
                        placeholder='Email'
                        {...register('email')}
                      />
                    </div>

                    <div className='relative w-full mb-3'>
                      <label
                        className='block uppercase text-blueGray-600 text-xs font-bold mb-2'
                        htmlFor='grid-password'
                      >
                        Password
                      </label>
                      <input
                        type='password'
                        className='border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150'
                        placeholder='Password'
                        {...register('password')}
                      />
                    </div>
                    {/* <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          id="customCheckLogin"
                          type="checkbox"
                          className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                        />
                        <span className="ml-2 text-sm font-semibold text-blueGray-600">
                          Remember me
                        </span>
                      </label>
                    </div> */}

                    <div className='text-center mt-6'>
                      <button
                        className='bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150'
                        type='submit'
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {/* <div className="flex flex-wrap mt-6 relative">
                <div className="w-1/2">
                  <a
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    className="text-blueGray-200"
                  >
                    <small>Forgot password?</small>
                  </a>
                </div>
                <div className="w-1/2 text-right">
                  <Link href="/auth/register">
                    <a href="#pablo" className="text-blueGray-200">
                      <small>Create new account</small>
                    </a>
                  </Link>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </>
    );
  } else if (session) {
    return <></>;
    // Router.push('/' + pathType + '/dashboard')
  }
}

Login.layout = Auth;
