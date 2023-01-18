import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import NotificationDropdown from 'components/Dropdowns/NotificationDropdown';
import UserDropdown from 'components/Dropdowns/UserDropdown';

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState('hidden');
  const router = useRouter();
  return (
    <>
      <nav className='md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6'>
        <div className='md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto'>
          {/* Toggler */}
          <button
            className='cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent'
            type='button'
            onClick={() => setCollapseShow('bg-white m-2 py-3 px-6')}
          >
            <i className='fas fa-bars'></i>
          </button>
          {/* Brand */}
          <Link
            href='#pablo'
            className='md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0'
          >
            RUSH BackOffice
          </Link>
          {/* User */}
          <ul className='md:hidden items-center flex flex-wrap list-none'>
            {/* <li className="inline-block relative">
              <NotificationDropdown />
            </li> */}
            {/* <li className="inline-block relative">
              <UserDropdown />
            </li> */}
          </ul>
          {/* Collapse */}
          <div
            className={
              'md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded ' +
              collapseShow
            }
          >
            {/* Form */}
            <form className='mt-6 mb-4 md:hidden'>
              <div className='mb-3 pt-0'>
                <input
                  type='text'
                  placeholder='Search'
                  className='border-0 px-3 py-2 h-12 border-solid  border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal'
                />
              </div>
            </form>

            {/* Divider */}
            <hr className='my-4 md:min-w-full' />
            {/* Heading */}
            <h6 className='md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline'>
              BackOffice Pages
            </h6>
            {/* Navigation */}

            <ul className='md:flex-col md:min-w-full flex flex-col list-none'>
              <li className='items-center'>
                <Link
                  href='/backoffice/dashboard'
                  className={
                    'text-xs uppercase py-3 font-bold block ' +
                    (router.pathname.indexOf('/backoffice/dashboard') !== -1
                      ? 'text-sky-500 hover:text-sky-600'
                      : 'text-blueGray-700 hover:text-blueGray-500')
                  }
                >
                  <i
                    className={
                      'fas fa-tv mr-2 text-sm ' +
                      (router.pathname.indexOf('/backoffice/dashboard') !== -1
                        ? 'opacity-75'
                        : 'text-blueGray-300')
                    }
                  ></i>{' '}
                  DashBoard
                </Link>
              </li>

              <li className='items-center'>
                <Link
                  href='/backoffice/restaurant'
                  className={
                    'text-xs uppercase py-3 font-bold block ' +
                    (router.pathname.indexOf('/backoffice/restaurant') !== -1
                      ? 'text-sky-500 hover:text-sky-600'
                      : 'text-blueGray-700 hover:text-blueGray-500')
                  }
                >
                  <i
                    className={
                      'fas fa-store-alt mr-2 text-sm ' +
                      (router.pathname.indexOf('/backoffice/restaurant') !== -1
                        ? 'opacity-75'
                        : 'text-blueGray-300')
                    }
                  ></i>{' '}
                  Restaurant
                </Link>
              </li>
              {/* <li className="items-center">
                <Link href="/backoffice/r_categories">
                  <a
                    href="#pablo"
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (router.pathname.indexOf("/backoffice/r_categories") !== -1
                        ? "text-sky-500 hover:text-sky-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                  >
                    <i
                      className={
                        "fas fa-layer-group mr-2 text-sm " +
                        (router.pathname.indexOf("/backoffice/r_categories") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Restaurant Categories
                  </a>
                </Link>
              </li> */}

              <li className='items-center'>
                <Link
                  href='/backoffice/music_style'
                  className={
                    'text-xs uppercase py-3 font-bold block ' +
                    (router.pathname.indexOf('/backoffice/music_style') !== -1
                      ? 'text-sky-500 hover:text-sky-600'
                      : 'text-blueGray-700 hover:text-blueGray-500')
                  }
                >
                  <i
                    className={
                      'fas fa-music mr-2 text-sm ' +
                      (router.pathname.indexOf('/backoffice/music_style') !== -1
                        ? 'opacity-75'
                        : 'text-blueGray-300')
                    }
                  ></i>{' '}
                  Music Style
                </Link>
              </li>

              {/* <li className="items-center">
                <Link href="/backoffice/menu_categories">
                  <a
                    href="#pablo"
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (router.pathname.indexOf("/backoffice/menu_categories") !== -1
                        ? "text-sky-500 hover:text-sky-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                  >
                    <i
                      className={
                        "fas fa-tools mr-2 text-sm " +
                        (router.pathname.indexOf("/backoffice/menu_categories") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Menu Categories
                  </a>
                </Link>
              </li> */}

              <li className='items-center'>
                <Link
                  href='/backoffice/role_management'
                  className={
                    'text-xs uppercase py-3 font-bold block ' +
                    (router.pathname.indexOf('/backoffice/role_management') !==
                    -1
                      ? 'text-sky-500 hover:text-sky-600'
                      : 'text-blueGray-700 hover:text-blueGray-500')
                  }
                >
                  <i
                    className={
                      'fas fa-user-tag mr-2 text-sm ' +
                      (router.pathname.indexOf(
                        '/backoffice/role_management'
                      ) !== -1
                        ? 'opacity-75'
                        : 'text-blueGray-300')
                    }
                  ></i>{' '}
                  User Management
                </Link>
              </li>

              {/* <li className="items-center">
                <Link href="/backoffice/permission">
                  <a
                    href="#pablo"
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (router.pathname.indexOf("/backoffice/permission") !== -1
                        ? "text-sky-500 hover:text-sky-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                  >
                    <i
                      className={
                        "fas fa-key mr-2 text-sm " +
                        (router.pathname.indexOf("/backoffice/permission") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Permission
                  </a>
                </Link>
              </li> */}

              <li className='items-center'>
                <Link
                  href='/backoffice/contact_provider'
                  className={
                    'text-xs uppercase py-3 font-bold block ' +
                    (router.pathname.indexOf('/backoffice/contact_provider') !==
                    -1
                      ? 'text-sky-500 hover:text-sky-600'
                      : 'text-blueGray-700 hover:text-blueGray-500')
                  }
                >
                  <i
                    className={
                      'fas fa-headset mr-2 text-sm ' +
                      (router.pathname.indexOf(
                        '/backoffice/contact_provider'
                      ) !== -1
                        ? 'opacity-75'
                        : 'text-blueGray-300')
                    }
                  ></i>{' '}
                  Contact Provider
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
