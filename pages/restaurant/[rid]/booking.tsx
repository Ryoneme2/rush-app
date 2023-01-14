import { useRouter } from 'next/router';
import React, { useRef, useState, Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Default from 'layouts/Default';

import { Dialog, Transition } from '@headlessui/react';
import { signIn, signOut } from 'next-auth/react';

import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import DatePicker from 'sassy-datepicker';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/core.css';

import TableZoneSelectionCard from 'components/Frontend/Card/TableZoneSelectionCard';
import { useSession } from 'next-auth/react';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { Session } from 'next-auth';

export async function getServerSideProps(ctx) {
  const prisma = new PrismaClient();
  // Fetch data from external API
  const { rid } = ctx.query;

  const response = await prisma.rESTAURANT.findFirst({
    where: { ID: parseInt(rid), IS_ACTIVE: true },
    include: {
      RESTAURANT_CATEGORIES: true,
      RESTAURANT_CONTACT: { where: { IS_ACTIVE: true } },
      RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } },
      RESTAURANT_MUSIC_STYLE: {
        where: { IS_ACTIVE: true },
        include: { MUSIC_STYLE: true },
      },
      RESTAURANT_PLAN: { where: { IS_ACTIVE: true }, orderBy: { ID: 'asc' } },
      BOOKING_PACKAGE: { where: { IS_ACTIVE: true }, orderBy: { ID: 'asc' } },
      AREA: {
        where: { IS_ACTIVE: true },
        select: {
          ID: true,
          NAME: true,
          DESCRIPTION: true,
          TABLE: { where: { IS_ACTIVE: true }, orderBy: { ID: 'asc' } },
        },
        orderBy: { ID: 'asc' },
      },
    },
    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();

  const data = JSON.parse(JSON.stringify(response));

  const packages = data.BOOKING_PACKAGE;

  let a = dayjs().startOf('day').toDate();
  let expireDate = dayjs(a).add(1, 'day').toDate();

  const responseB = await prisma.bOOKING.findMany({
    where: {
      RESTAURANT_ID: parseInt(data.ID),
      BOOK_DATETIME: {
        // gte: new Date(a),
        // lt: new Date(expireDate.setDate(expireDate.getDate() + 1)),
        gte: a,
        lt: expireDate,
      },
      IS_ACTIVE: true,
      // IS_APPROVE: true
    },
    select: {
      BOOKING_TABLES: { select: { TABLE: true } },
    },

    orderBy: [{ ID: 'asc' }],
  });
  await prisma.$disconnect();

  const avaliableTable = JSON.parse(JSON.stringify(responseB));

  let modifiedData = { AREA: [] };

  data.AREA.map((e) => {
    e.TABLE.map((i) => {
      i.IS_RESERVE = false;
      avaliableTable?.map((a) => {
        a.BOOKING_TABLES?.map((t) => {
          if (i.ID == t.TABLE.ID) {
            i.IS_RESERVE = true;
          }
        });
      });
    });
    modifiedData.AREA.push(e);
  });

  // Pass data to the page via props
  return {
    props: {
      data,
      packages,
      avaliableTable,
      rid,
      dataTable: data,
      modifiedData,
    },
  };
}

function Restaurant({
  data,
  packages,
  avaliableTable,
  rid,
  dataTable,
  modifiedData,
}) {
  const MySwal = withReactContent(Swal);

  function GetDate() {
    let items = [];

    for (var i = 1; i <= 31; i++) {
      items.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
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
      items.push(
        <option value={months[i]} key={i}>
          {months[i]}
        </option>
      );
    }
    return items;
  }

  function GetYear() {
    let items = [];

    const currentDate = new Date().getFullYear() - 20;

    for (var i = 1950; i <= currentDate; i++) {
      items.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
    return items;
  }

  const [registeredEmail, setRegisteredEmail] = React.useState('');
  const [resetPassEmail, setResetPassEmail] = React.useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [createAccountEmailModalOpen, setCreateAccountEmailModalOpen] =
    useState(false);
  const [rePasswordModalOpen, setRePasswordModalOpen] = useState(false);
  const [rePasswordConfirmModalOpen, setRePasswordConfirmModalOpen] =
    useState(false);
  const cancelButtonRef = useRef(null);
  const [showPass, setShowPass] = useState(false);
  const [term, setTermModalOpen] = useState(false);
  const [PDPA, setPDPAModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const { data: session } = useSession() as {
    data: Session & {
      tokenUser: string;
    };
  };
  const [a, setA] = useState(modifiedData);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [passData, setPassData] = useState({});

  const [bookingStep, setBookingStep] = useState(false);
  const [restaurantImage, setResImage] = useState(true);
  const [zoneSelected, setZoneSelected] = useState('Overall');

  const [datepickerInput, setDatepickerInput] = useState(() => {
    if (new Date().getHours() < 7) {
      return new Date(
        new Date(new Date().setUTCHours(17, 0, 0, 0)).setUTCDate(
          new Date().getUTCDate()
        )
      );
    } else {
      return new Date(
        new Date(new Date().setUTCHours(17, 0, 0, 0)).setUTCDate(
          new Date().getUTCDate() - 1
        )
      );
    }
  });

  const [guestInput, setGuest] = useState(1);
  const [perTable, setPerTable] = useState(0);

  const [pickTableList, setPickTableList] = useState([]);
  const [pickedPackage, setPickedPackage] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (session?.user && !session?.fname) {
      MySwal.fire({
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: 'อีเมลนี้ถูกใช้สมัครไปแล้ว',
        icon: 'error',
        confirmButtonText: 'OK',
      }).then(() => {
        signOut();
      });
    } else {
      return null;
    }
  });

  async function registerEmail(data) {
    let date = new Date(data.date + data.month + data.year);

    setRegisteredEmail(data.email);

    try {
      const res = await fetch(`/api/action/register/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstname,
          lastName: data.lastname,
          birthDate: date,
          phone: data.phone,
        }),
      });

      if (res.status == 200) {
        setCreateAccountEmailModalOpen(false);
        MySwal.fire({
          title: 'สมัครบัญชีผู้ใช้สำเร็จ',
          html: "<div class='px-5 sm:px-16'><p class='text-left'>ท่านสามารถเริ่มทำการล็อกอินเข้าสู่ระบบ&nbsp; เพื่อจองโต๊ะในร้านที่ต้องการได้ทันที</p></div>",
          icon: 'success',
          confirmButtonText: 'ok',
        });
      }

      if (res.status == 400) {
        MySwal.fire({
          title: 'เกิดข้อผิดพลาด',
          html: "<div class='px-4 sm:px-14 text-left'><p>อีเมลที่ท่านกรอกถูกใช้งานแล้ว</p><p>กรุณากรอกอีเมลใหม่อีกครั้ง</p></div>",
          icon: 'error',
          confirmButtonText: 'ok',
        });
      }
    } catch (error) {
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonText: 'close',
      });
    }

    // setCreateAccountEmailModalOpen(false)

    // http://localhost:3000/api/action/register/create
  }
  async function Login(data) {
    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      // tenantKey: "values.tenantKey",
      // callbackUrl: `${window.location.origin}`,
    });

    if (res.status == 200) {
      setLoginModalOpen(false);
      localStorage.clear();
    }

    if (res.status == 401) {
      MySwal.fire({
        title: 'เกิดข้อผิดพลาด',
        html: "<div class='px-4 sm:px-14'><p class='text-left'>อีเมลหรือรหัสผ่านที่ท่านกรอกไม่ถูกต้อง&nbsp;&nbsp;&nbsp; กรุณากรอกข้อมูลอีเมลหรือรหัสผ่านใหม่อีกครั้ง</p></div>",
        icon: 'error',
        confirmButtonText: 'ok',
      });
    }
  }

  async function loginGoogle() {
    const res = await signIn('google');
    localStorage.clear();
  }

  async function loginFacebook() {
    const res = await signIn('facebook');
  }

  function handleGuest(amount) {
    if (amount == -1 && guestInput > 1) {
      setGuest(guestInput - 1);
      return;
    }

    if (amount == 1 && guestInput < 99) {
      setGuest(guestInput + 1);
      return;
    }
  }

  function HandleTableCount() {
    return <span>{pickTableList.length.toString()} Tables select</span>;
  }

  async function CheckAvaliableTable(date: any) {
    let startDate = new Date(date);
    let expireDate = new Date(date);

    try {
      avaliableTable = await fetch(
        `/api/action/booking/findmanyBkTbAvailable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            restaurantId: data.ID,
            bookStartDatetime: new Date(startDate.setHours(0, 0, 0, 0)),
            bookEndDatetime: new Date(
              expireDate.setDate(expireDate.getDate() + 1)
            ),
          }),
        }
      );

      avaliableTable = await avaliableTable.json();
    } catch (error) {
      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonText: 'close',
      });
    }

    let modifiedData = { AREA: [] };

    data.AREA.map((e) => {
      e.TABLE.map((i) => {
        i.IS_RESERVE = false;
        avaliableTable?.map((a) => {
          a.BOOKING_TABLES?.map((t) => {
            if (i.ID == t.TABLE.ID) {
              i.IS_RESERVE = true;
            }
          });
        });
      });
      modifiedData.AREA.push(e);
    });

    setA(modifiedData);
  }

  function HandleTableFilter() {
    let element;

    if (zoneSelected == 'Overall') {
      element = a.AREA.map((zoneTableData) => {
        return zoneTableData.TABLE.map((tableData, key) => {
          return (
            <div
              key={key}
              onClick={() => {
                if (!tableData.IS_RESERVE) {
                  if (pickTableList.includes(tableData.ID)) {
                    setPerTable(perTable - tableData.SEATS_AMOUNT);
                    setPickTableList(
                      pickTableList.filter((data) => {
                        return data !== tableData.ID;
                      })
                    );
                  } else {
                    setPerTable(perTable + tableData.SEATS_AMOUNT);
                    setPickTableList([...pickTableList, tableData.ID]);
                  }
                }
              }}
            >
              <TableZoneSelectionCard
                key={tableData.ID}
                isReserved={tableData.IS_RESERVE}
                zoneName={zoneTableData.NAME}
                Guest={tableData.SEATS_AMOUNT}
                tableLocation={tableData.NAME}
                isPick={pickTableList.includes(tableData.ID)}
              />
            </div>
          );
        });
      });
    } else {
      element = (
        <div>
          {a.AREA.filter((area) => area.NAME == zoneSelected).map(
            (filterZoneTableData, key) => {
              return (
                <div key={key}>
                  {filterZoneTableData.TABLE.map((filterTableData, key) => {
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (!filterTableData.IS_RESERVE) {
                            if (pickTableList.includes(filterTableData.ID)) {
                              setPerTable(
                                perTable - filterTableData.SEATS_AMOUNT
                              );
                              setPickTableList(
                                pickTableList.filter((data) => {
                                  return data !== filterTableData.ID;
                                })
                              );
                            } else {
                              setPerTable(
                                perTable + filterTableData.SEATS_AMOUNT
                              );
                              setPickTableList([
                                ...pickTableList,
                                filterTableData.ID,
                              ]);
                            }
                          }
                        }}
                      >
                        <TableZoneSelectionCard
                          isReserved={filterTableData.IS_RESERVE}
                          zoneName={filterZoneTableData.NAME}
                          Guest={filterTableData.SEATS_AMOUNT}
                          tableLocation={filterTableData.NAME}
                          isPick={pickTableList.includes(filterTableData.ID)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            }
          )}
        </div>
      );
    }

    return element;
  }

  let dateCheck = new Date();

  if (data.IS_CANCLE_POLICY) {
    if (
      dateCheck.getDate() == datepickerInput.getDate() &&
      dateCheck.getMonth() == datepickerInput.getMonth() &&
      dateCheck.getFullYear() == datepickerInput.getFullYear()
    ) {
      if (dateCheck.getHours() >= 19) {
        MySwal.fire({
          title:
            "<div class='text-xl'><p>การจองโต๊ะในวันนี้ปิดให้บริการแล้ว</p></div>",
          html: "<div class='text-left'><p>ขณะนี้ระบบในการจองโต๊ะของวันนี้ได้ถูกปิดลงแล้ว แต่ระบบการจองล่วงหน้าตั้งแต่วันพรุ่งนี้เป็นต้นไปยังสามารถทำได้ตามปกติ หากลูกค้ายังต้องการที่จะใช้บริการร้านนี้ในวันนี้อาจจะพอมีโอกาสจากการ Walk-in โดยตรงที่หน้าร้านครับ</p></div>",
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        setDatepickerInput(
          new Date(new Date().setDate(new Date().getDate() + 1))
        );
        return;
      }
    }
  }

  async function PassDataToSummary() {
    let dateCheck = new Date();
    if (data.IS_CANCLE_POLICY) {
      if (
        dateCheck.getDate() == datepickerInput.getDate() &&
        dateCheck.getMonth() == datepickerInput.getMonth() &&
        dateCheck.getFullYear() == datepickerInput.getFullYear()
      ) {
        if (dateCheck.getHours() >= 19) {
          MySwal.fire({
            title:
              "<div class='text-xl'><p>การจองโต๊ะในวันนี้ปิดให้บริการแล้ว</p></div>",
            text:
              'ขณะนี้ระบบในการจองโต๊ะของวันที่ ' +
              new Date().getDate().toString() +
              '/' +
              new Date().getMonth().toString() +
              '/' +
              new Date().getFullYear().toString().slice(-2) +
              ' ได้ถูกปิดลงแล้วแต่ระบบการจองล่วงหน้าตั้งแต่วันที่ ' +
              new Date(new Date().setDate(new Date().getDate() + 1))
                .getDate()
                .toString() +
              '/' +
              new Date(new Date().setDate(new Date().getDate() + 1))
                .getMonth()
                .toString() +
              '/' +
              new Date(new Date().setDate(new Date().getDate() + 1))
                .getFullYear()
                .toString()
                .slice(-2) +
              ' ขึ้นไปยังสามารถทำได้ตามปกติ หากลูกค้ายังต้องการที่จะใช้บริการร้านนี้ในวันนี้อาจจะพอมีโอกาสจากการ Walk-in โดยตรงที่หน้าร้านครับ',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          setDatepickerInput(
            new Date(new Date().setDate(new Date().getDate() + 1))
          );
          return;
        }
      }
    }

    let filterTableData = data.AREA.map((table) => {
      return {
        NAME: table.NAME,
        TABLE: table.TABLE.filter((t) => pickTableList.includes(t.ID)),
      };
    });

    data.BOOKING_PACKAGE.map((bk) => {});

    if (session) {
      const pushDate = new Date(datepickerInput);

      router.push({
        pathname: '/confirmation/summary',
        query: {
          data: JSON.stringify({
            restaurantId: data.ID,
            guests_amount: guestInput,
            bookingDatetime: new Date(pushDate.setUTCHours(17, 0, 0, 0)),
            totalPrice: totalPrice + (totalPrice * data.FEE) / 100,
            BOOKING_TABLES: pickTableList,
            BOOKING_PACKAGE_SELECT: pickedPackage,
            status: 'Pending',
          }),
          Name: data.NAME,
          IS_CANCLE_POLICY: data.IS_CANCLE_POLICY,
          fee: (totalPrice * data.FEE) / 100,
          feePercent: data.FEE,
          condition: data.CONDITION,
          images: data.RESTAURANT_GALLERY[0].FILE_PATH,
          Location: data.ADDRESS,
          tableCount: pickTableList.length,
          tableData: JSON.stringify(filterTableData),
          packageData: JSON.stringify(data.BOOKING_PACKAGE),
        },
      });
    } else {
      MySwal.fire({
        title: 'กรุณาเข้าสู่ระบบ',
        html: "<div class='px-4'><p class='text-left'>ลูกค้ากรุณาเข้าสู่ระบบเพื่อดำเนินการจองในขั้นตอนต่อไป</p></div>",
        icon: 'warning',
        confirmButtonText: 'ok',
      });
    }
  }

  const settings = {
    dots: false,
    infinite: false,
    speed: 200,
    slidesToScroll: 1,
    variableWidth: true,
    adaptiveHeight: false,
  };
  const defaultZoneBTN =
    'text-center font-bold rounded-lg text-sm zone-btn py-3 px-4 truncate';
  const activeZoneBTN =
    'bg-primary font-bold text-white rounded-lg text-sm py-3 px-4 truncate';

  const btnStyle = 'flex flex-col justify-center items-center';
  const disableBtnStyle =
    'flex flex-col justify-center items-center opacity-60 cursor-not-allowed';
  return (
    <div>
      <h1
        className='text-base font-bold flex flex-row pt-8 px-6 cursor-pointer'
        onClick={() => {
          history.back();
        }}
      >
        <div className='mr-4'>
          <i className='fas fa-chevron-left'></i>
        </div>
        <h2>Back to restaurant profile</h2>
        <div></div>
      </h1>
      <section className='w-full flex flex-wrap items-center justify-between'>
        <div className='flex flex-wrap items-center '>
          <div className='grid grid-cols-12 w-full'>
            <div className='col-span-full pb-8 pt-8 order-1'>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
              >
                {data.RESTAURANT_PLAN.map((i, key) => {
                  return (
                    <SwiperSlide key={key}>
                      <img
                        className='max-h-96 rounded-lg mx-auto'
                        src={i.FILE_PATH}
                        alt=''
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
          <div className='grid grid-cols-8 w-full pb-14'>
            <div className='block col-span-full px-5 mb-9'>
              <div className='flex sm:flex-col xl:flex-row justify-between gap-6 sm:gap-0 mb-6'>
                <div className='w-full'>
                  <Menu
                    menuButton={
                      <MenuButton className='w-full h-full'>
                        <div className='rounded-lg shadow-md  flex flex-row nav-input text-left sm:mb-3 xl:mb-0 xl:mr-2'>
                          <i className='far fa-calendar mx-4 my-auto'></i>
                          <div className='px-2'>
                            <p className='text-sm'>Date</p>
                            <p className='text-sm font-bold'>
                              {datepickerInput.getDate().toString()}/
                              {(datepickerInput.getMonth() + 1).toString()}/
                              {datepickerInput.getFullYear().toString()}
                            </p>
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
                      <div className=' z-2 bg-light shadow-md rounded-lg '>
                        <DatePicker
                          onChange={(date) => {
                            const checkDate = new Date(date);

                            if (new Date().getHours() < 7) {
                              if (
                                checkDate >=
                                new Date(
                                  new Date(
                                    new Date().setUTCHours(17, 0, 0, 0)
                                  ).setUTCDate(new Date().getUTCDate())
                                )
                              ) {
                                setDatepickerInput(date);
                                CheckAvaliableTable(date);
                              } else {
                                setDatepickerInput(new Date());
                                MySwal.fire({
                                  title: 'เกิดข้อผิดพลาด',
                                  text: 'วันที่เลือกสามารถไม่สามารถทำการจองได้',
                                  icon: 'warning',
                                  confirmButtonText: 'ok',
                                });
                              }
                            } else {
                              if (
                                checkDate >=
                                new Date(
                                  new Date(
                                    new Date().setUTCHours(17, 0, 0, 0)
                                  ).setUTCDate(new Date().getUTCDate() - 1)
                                )
                              ) {
                                setDatepickerInput(date);
                                CheckAvaliableTable(date);
                              } else {
                                setDatepickerInput(new Date());
                                MySwal.fire({
                                  title: 'เกิดข้อผิดพลาด',
                                  text: 'วันที่เลือกสามารถไม่สามารถทำการจองได้',
                                  icon: 'warning',
                                  confirmButtonText: 'ok',
                                });
                              }
                            }

                            setPickTableList([]);
                          }}
                          selected={datepickerInput}
                        />
                      </div>
                    </MenuItem>
                  </Menu>
                </div>
                <div className='w-full'>
                  <Menu
                    menuButton={
                      <MenuButton className='w-full h-full'>
                        <div className='rounded-lg shadow-md xl:ml-2 flex flex-row nav-input text-left'>
                          <i className='fas fa-user-friends mx-4 my-auto'></i>
                          <div className=''>
                            <p className='text-sm'>Guest</p>
                            <p className='text-sm font-bold'>
                              {guestInput}
                              &nbsp; Person
                              {/* {guestInput > 1 ? "People" : "Person"} */}
                            </p>
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
                      <div className=' z-2 bg-light shadow-md '>
                        <div className='flex flex-row items-center p-4'>
                          <div className='mr-20'>
                            <p>Adult</p>
                            <p>Ages 20 or above</p>
                          </div>
                          <div>
                            <div>
                              <button
                                className='person-btn'
                                onClick={() => {
                                  handleGuest(-1);
                                }}
                              >
                                -
                              </button>{' '}
                              <span className='mx-3'>{guestInput}</span>{' '}
                              <button
                                className='person-btn'
                                onClick={() => {
                                  handleGuest(1);
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              <div className='shadow-md border border-gray-400 rounded-lg py-8 w-full mx-auto'>
                {!bookingStep && (
                  <div className='px-5'>
                    <h2 className='font-bold text-xl mb-6'>Select location</h2>
                    <p className='mb-6'>Zones</p>

                    <div className='w-full mx-auto mb-6 px-6'>
                      <Slider {...settings}>
                        <button
                          className={
                            zoneSelected === 'Overall'
                              ? activeZoneBTN
                              : defaultZoneBTN
                          }
                          value='Overall'
                          onClick={() => {
                            setZoneSelected('Overall');
                          }}
                        >
                          <span>Overall</span>
                        </button>
                        {data.AREA.map((zoneData, key) => {
                          return (
                            <button
                              key={key}
                              className={
                                zoneSelected === zoneData.NAME
                                  ? activeZoneBTN
                                  : defaultZoneBTN
                              }
                              value={zoneData.NAME}
                              onClick={() => {
                                setZoneSelected(zoneData.NAME);
                              }}
                            >
                              <span>{zoneData.NAME}</span>
                            </button>
                          );
                        })}
                      </Slider>
                    </div>

                    <div className='shadow-md border-2 rounded-md p-3 mb-8 overflow-auto max-h-96'>
                      <HandleTableFilter />
                    </div>

                    <div className='flex flex-row justify-between mb-8'>
                      <HandleTableCount />
                    </div>

                    <button
                      className='rounded-md font-bold w-full bg-primary text-white py-2'
                      onClick={() => {
                        if (
                          pickTableList.length != 0 &&
                          guestInput <= perTable
                        ) {
                          setBookingStep(true);
                        } else {
                          MySwal.fire({
                            title:
                              "<div class=''><p>โปรดเลือกโต๊ะเพิ่ม</p></div>",
                            html:
                              "<div class='px-0 sm:px-16 text-left'><p class='ml-2'>ลูกค้ากรุณาเลือกโต๊ะเพิ่มให้สอดคล้องกับ</p><p class='ml-2'>จำนวนแขกอีก " +
                              (guestInput - perTable) +
                              ' ท่าน</p>',
                            icon: 'warning',
                            confirmButtonText: 'ok',
                          });
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}

                {bookingStep && (
                  <div>
                    <div className='flex flex-row w-full justify-between mb-6 px-5'>
                      <i
                        className='fas fa-chevron-left self-center cursor-pointer text-xl'
                        onClick={() => {
                          setBookingStep(false);
                        }}
                      ></i>
                      <h2 className='font-bold'>Select package</h2>
                      <div></div>
                    </div>
                    <div className='mb-8 px-5'>
                      You must select at least {pickTableList.length} package
                    </div>

                    <div className='h-80 overflow-auto border-y mb-6 px-5 py-6'>
                      {packages.map((data, key) => {
                        return (
                          <div
                            key={key}
                            className='flex flex-col mb-4 space-y-2 py-3'
                          >
                            <div className='flex flex-row justify-between mb-6'>
                              <div className='flex flex-col justify-center'>
                                <h2 className='font-bold select-package-name mb-4'>
                                  {data.NAME}
                                </h2>
                                <p className='whitespace-normal break-words'>
                                  <div
                                    className='space-y-2'
                                    dangerouslySetInnerHTML={{
                                      __html: data.DESCRIPTION,
                                    }}
                                  ></div>
                                </p>
                              </div>

                              {/* <div>
                                                                <img src="https://www.w3schools.com/w3css/img_lights.jpg" alt="" className='w-24 h-24 rounded-md ' />
                                                            </div> */}
                            </div>
                            <div className='flex flex-row justify-between'>
                              <p className='font-bold align-middle'>
                                {data.PRICE} THB
                              </p>

                              <div className='flex flex-row justify-center'>
                                <div className='self-end'>
                                  <button
                                    className='person-btn'
                                    onClick={() => {
                                      const index = pickedPackage.indexOf(
                                        data.ID.toString()
                                      );
                                      if (index > -1) {
                                        const list = [...pickedPackage];

                                        list.splice(index, 1);

                                        setPickedPackage(list);
                                        setTotalPrice(
                                          totalPrice - parseInt(data.PRICE)
                                        );
                                      }
                                    }}
                                  >
                                    -
                                  </button>

                                  <span className='mx-3'>
                                    {
                                      pickedPackage.filter((i) =>
                                        i.includes(data.ID)
                                      ).length
                                    }
                                  </span>

                                  <button
                                    className='person-btn'
                                    onClick={() => {
                                      setPickedPackage([
                                        ...pickedPackage,
                                        data.ID.toString(),
                                      ]);
                                      setTotalPrice(
                                        totalPrice + parseInt(data.PRICE)
                                      );
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className='flex flex-row mb-5 px-5'>
                      {pickedPackage.length} package select
                    </div>
                    <div className='flex flex-row justify-between mb-5 px-5'>
                      <p>Service fee</p>
                      <p>{(totalPrice * data.FEE) / 100} THB</p>
                    </div>
                    <div className='flex flex-row justify-between mb-5 font-bold px-5'>
                      <p>Total</p>

                      <p>{totalPrice + (totalPrice * data.FEE) / 100} THB</p>
                    </div>
                    <div
                      className='px-5'
                      onClick={() => {
                        if (pickedPackage.length >= pickTableList.length) {
                          if (
                            pickTableList.length != 0 &&
                            guestInput <= perTable
                          ) {
                            PassDataToSummary();
                          } else {
                            MySwal.fire({
                              title:
                                "<div class=''><p>โปรดเลือกโต๊ะเพิ่ม</p></div>",
                              html:
                                "<div class='px-0 sm:px-16 text-left'><p class='ml-2'>ลูกค้ากรุณาเลือกโต๊ะเพิ่มให้สอดคล้องกับ</p><p class='ml-2'>จำนวนแขกอีก " +
                                (guestInput - perTable) +
                                ' ท่าน</p>',
                              icon: 'warning',
                              confirmButtonText: 'ok',
                            });
                          }
                        } else {
                          MySwal.fire({
                            title:
                              "<h1 class='text-xl'>กรุณาเลือกแพ็คเกจให้ครบ</h1>",
                            html: `<div class='text-left px-0 sm:px-16'><p>ลูกค้ากรุณาเลือกแพ็คเกจให้ครบจำนวน</p><p> ${pickTableList.length} แพ็คเกจ</p></div>`,
                            icon: 'warning',
                            confirmButtonText: 'ok',
                          });
                        }
                      }}
                    >
                      <button className='w-full text-center font-bold bg-primary text-white py-2 rounded-md'>
                        Booking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

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
              if (session) {
                router.push({
                  pathname: '/mobile/',
                });
              } else {
                setLoginModalOpen(true);
              }
            }}
          >
            <i className='far fa-user-circle'></i>
            <p>Profile</p>
          </button>
        </div>
      </nav>

      <Transition.Root show={loginModalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={() => {
            setLoginModalOpen(false);
            reset();
            setShowPass(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed z-10 inset-0 overflow-y-auto'>
            <div className='flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto  shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5'>
                  <div className='flex flex-row justify-end'>
                    <i
                      className='fas fa-times cursor-pointer'
                      onClick={() => {
                        setLoginModalOpen(false);
                      }}
                    ></i>
                  </div>
                  <h1 className='text-xl font-bold mb-5'>Log in or sign up</h1>
                  <form action='' onSubmit={handleSubmit(Login)}>
                    <label>Email</label>
                    <input
                      type='email'
                      name='email'
                      className='w-full rounded-lg mb-5'
                      {...register('email')}
                    />

                    <label>Password</label>
                    <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3 mb-8'>
                      <input
                        type={showPass ? 'text' : 'password'}
                        minLength={6}
                        className=' rounded-md w-11/12 border-0'
                        {...register('password')}
                        required
                      />
                      <i
                        className='far fa-eye self-center text-lg cursor-pointer'
                        onClick={() => {
                          setShowPass(!showPass);
                        }}
                      ></i>
                    </div>

                    {/* <div className="flex flex-row justify-between mb-5">
                          <div><input type="checkbox" name="rememeberPassword" id="" className="mr-3" /><label htmlFor="">Remember me</label></div> */}
                    {/* <button onClick={() => { setLoginModalOpen(false); setRePasswordModalOpen(true) }}>Forgot password?</button> */}
                    {/* </div> */}

                    <button
                      type='submit'
                      className='bg-primary text-white rounded-md w-full font-bold h-10 mb-5'
                    >
                      Continue
                    </button>
                  </form>

                  <div className='text-center mb-5'>
                    Don't have an account?{' '}
                    <button
                      className='text-primary font-bold'
                      onClick={() => {
                        setLoginModalOpen(false);
                        setRegisterModalOpen(true);
                        reset();
                      }}
                    >
                      Sign up
                    </button>
                  </div>

                  <div className='text-center mb-5'>Or</div>

                  <button
                    className='text-black hover:bg-gray-100 border-2 rounded-md w-full font-bold h-10 flex flex-row justify-between items-center px-3 mb-5'
                    onClick={() => {
                      loginGoogle();
                    }}
                  >
                    <div>
                      <i className='fab fa-google'></i>
                    </div>{' '}
                    <div>Continue with Google</div> <div></div>
                  </button>

                  {/* <button className="text-black hover:bg-gray-100 border-2 rounded-md w-full h-10 flex flex-row justify-between items-center px-3 mb-5" onClick={() => { loginFacebook() }}><div><i className="fab fa-facebook"></i></div> <div>Continue with Facebook</div> <div></div></button> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={registerModalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={() => {
            setRegisterModalOpen(false);
            reset();
            setShowPass(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed z-10 inset-0 overflow-y-auto'>
            <div className='flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto  shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5'>
                  <div className='flex flex-row justify-end'>
                    <i
                      className='fas fa-times cursor-pointer'
                      onClick={() => {
                        setRegisterModalOpen(false);
                      }}
                    ></i>
                  </div>
                  <h1 className='text-xl font-bold mb-5'>Welcome to Rush</h1>
                  <button
                    className='text-white bg-primary hover:opacity-95 border-2 rounded-md w-full font-bold h-10 flex flex-row justify-between items-center px-3 mb-5'
                    onClick={() => {
                      setCreateAccountEmailModalOpen(true);
                      setRegisterModalOpen(false);
                    }}
                  >
                    <div>
                      <i className='fas fa-envelope'></i>
                    </div>{' '}
                    <div>Sign up with email</div> <div></div>
                  </button>

                  {/* <button className="text-white bg-primary hover:opacity-95 border-2 rounded-md w-full h-10 flex flex-row justify-between items-center px-3 mb-5"><div><i className="fas fa-phone-alt"></i></div> <div>Sign up with phone number</div> <div></div></button> */}

                  <div className='text-center mb-5'>Or</div>

                  <button
                    className='text-black hover:bg-gray-100 border-2 rounded-md w-full font-bold h-10 flex flex-row justify-between items-center px-3 mb-8'
                    onClick={() => {
                      loginGoogle();
                    }}
                  >
                    <div>
                      <i className='fab fa-google'></i>
                    </div>{' '}
                    <div>Continue with Google</div> <div></div>
                  </button>

                  <div className='mb-5'>
                    Already have an account?{' '}
                    <button
                      className='text-primary font-bold'
                      onClick={() => {
                        setLoginModalOpen(true);
                        setRegisterModalOpen(false);
                        reset();
                      }}
                    >
                      Login
                    </button>
                  </div>
                  {/* <button className="text-black hover:bg-gray-100 border-2 rounded-md w-full h-10 flex flex-row justify-between items-center px-3 mb-5" onClick={() => { loginFacebook() }}><div><i className="fab fa-facebook"></i></div> <div>Continue with Facebook</div> <div></div></button> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={createAccountEmailModalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={() => {
            setCreateAccountEmailModalOpen(false);
            reset();
            setShowPass(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed z-10 inset-0 overflow-y-auto'>
            <div className='flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5'>
                  <h1 className='text-xl font-bold mb-5 flex flex-row justify-between'>
                    <div>
                      <i
                        className='fas fa-chevron-left cursor-pointer'
                        onClick={() => {
                          setCreateAccountEmailModalOpen(false);
                          setRegisterModalOpen(true);
                        }}
                      ></i>
                    </div>{' '}
                    <h1>Create an Account</h1> <div></div>
                  </h1>
                  <form action='' onSubmit={handleSubmit(registerEmail)}>
                    <div className='my-5'>
                      <label htmlFor=''>
                        Email<span className='text-red-600'>*</span>{' '}
                      </label>
                      <input
                        type='email'
                        name='email'
                        className='w-full rounded-lg'
                        {...register('email')}
                        required
                      />
                    </div>

                    <div className='my-5'>
                      <label htmlFor=''>
                        Password<span className='text-red-600'>*</span>{' '}
                      </label>
                      <div className='w-full flex flex-row justify-between border-1 rounded-md pr-3'>
                        <input
                          type={showPass ? 'text' : 'password'}
                          minLength={6}
                          className=' rounded-md w-11/12 border-0'
                          {...register('password')}
                          required
                        />
                        <i
                          className='far fa-eye self-center text-lg cursor-pointer'
                          onClick={() => {
                            setShowPass(!showPass);
                          }}
                        ></i>
                      </div>
                    </div>

                    <div className='my-5'>
                      <label htmlFor=''>
                        First name<span className='text-red-600'>*</span>{' '}
                      </label>
                      <input
                        type='text'
                        name='firstname'
                        className='w-full rounded-lg'
                        {...register('firstname')}
                        required
                      />
                    </div>

                    <div className='my-5'>
                      <label htmlFor=''>
                        Last name<span className='text-red-600'>*</span>{' '}
                      </label>
                      <input
                        type='text'
                        name='lastname'
                        className='w-full rounded-lg mb-2'
                        {...register('lastname')}
                        required
                      />
                      <p className='text-sm'>
                        Make sure your first and last name matches on your
                        government ID.
                      </p>
                    </div>

                    <div className='my-5 flex flex-col'>
                      <label htmlFor=''>
                        Date of birth<span className='text-red-600'>*</span>{' '}
                      </label>
                      <div className='flex flex-row w-full gap-1 mb-2'>
                        <select
                          name=''
                          id=''
                          className='flex-1 rounded-md'
                          {...register('date')}
                          required
                        >
                          {GetDate()}
                        </select>
                        <select
                          name=''
                          id=''
                          className='flex-1 rounded-md'
                          {...register('month')}
                          required
                        >
                          {GetMonths()}
                        </select>
                        <select
                          name=''
                          id=''
                          className='flex-1 rounded-md'
                          {...register('year')}
                          required
                        >
                          {GetYear()}
                        </select>
                      </div>
                      <p className='text-sm'>
                        You must be at least 20 years old because your
                        government ID must be checked before entering the
                        service.
                      </p>
                    </div>

                    <div className='my-5'>
                      <label htmlFor=''>
                        Phone number<span className='text-red-600'>*</span>{' '}
                      </label>
                      <input
                        type='tel'
                        name='Phone'
                        minLength={10}
                        maxLength={10}
                        className='w-full rounded-lg'
                        {...register('phone')}
                        required
                      />
                    </div>

                    <div className='my-5'>
                      <span className='text-sm'>
                        By selecting Agree and continue, I agree to Rush{' '}
                      </span>
                      <span
                        className='text-sm text-term cursor-pointer underline'
                        onClick={() => {
                          setTermModalOpen(true);
                        }}
                      >
                        Term of Service{' '}
                      </span>
                      <span className='text-sm'>and acknowledge the </span>
                      <span
                        className='text-sm text-term cursor-pointer underline'
                        onClick={() => {
                          setPDPAModalOpen(true);
                        }}
                      >
                        PDPA Privacy Policy
                      </span>
                    </div>
                    <button
                      type='submit'
                      className='bg-primary text-white rounded-md font-bold w-full h-10 mb-5'
                      onClick={() => {
                        setLoginModalOpen(false);
                      }}
                    >
                      Agree and continue
                    </button>
                    {/* <div className="my-5">
                          <span className="text-sm">Rush will send a notification, news, member-only deal, and promotions direct to your email</span>
                        </div>
                        <div className="my-5 flex flex-row">
                          <input type="checkbox" name="" id="" {...register("news")} />
                          <span className="text-sm ml-3">I don't want to receive marketing message from Rush</span>
                        </div> */}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={rePasswordModalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={() => {
            setRePasswordModalOpen(false);
            reset();
            setShowPass(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed z-10 inset-0 overflow-y-auto'>
            <div className='flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5'>
                  <h1 className='text-xl font-bold mb-5 flex flex-row justify-between'>
                    <div>
                      <i
                        className='fas fa-chevron-left cursor-pointer'
                        onClick={() => {
                          setRePasswordModalOpen(false);
                          setLoginModalOpen(true);
                        }}
                      ></i>
                    </div>{' '}
                    <h1>Reset password</h1> <div></div>
                  </h1>
                  <p>Enter the email address associated with your account,</p>
                  <p> and we'll send you a link to reset your password</p>

                  <input
                    type='email'
                    name='email'
                    placeholder='Email'
                    className='w-full rounded-lg my-5'
                    onChange={(e) => {
                      setResetPassEmail(e.target.value);
                    }}
                  />

                  <button
                    className='bg-primary text-white rounded-md w-full h-10 mb-5'
                    onClick={() => {
                      setRePasswordConfirmModalOpen(true);
                      setRePasswordModalOpen(false);
                    }}
                  >
                    Send a link
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={rePasswordConfirmModalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={() => {
            setRePasswordConfirmModalOpen(false);
            reset();
            setShowPass(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed z-10 inset-0 overflow-y-auto'>
            <div className='flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5'>
                  <h1 className='text-xl font-bold mb-5 flex flex-row justify-between'>
                    <div></div> <h1>Reset password</h1>{' '}
                    <div>
                      <i
                        className='fas fa-times cursor-pointer'
                        onClick={() => {
                          setRePasswordConfirmModalOpen(false);
                        }}
                      ></i>
                    </div>
                  </h1>

                  <div className='flex flex-row border-2 border-gray-100 justify-start p-2'>
                    <div className='mx-3'>
                      <i className='fas fa-envelope'></i>
                    </div>
                    <div>
                      <h1 className='font-bold'>Check your email inbox!</h1>
                      <p> A link to reset your password has been</p>
                      <p> sent to {resetPassEmail}</p>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={term} as={Fragment}>
        <Dialog
          as='div'
          static
          className='relative z-10'
          onClose={() => {
            setTermModalOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed z-10 inset-0 overflow-y-auto'>
            <div className='flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5'>
                  <div className='flex flex-col h-96 space-y-3'>
                    <h1 className='font-bold'>
                      ข้อกำหนด เงื่อนไขการใช้บริการของลูกค้าและร้านค้า
                      ภายใต้แพลตฟอร์ม rushbooking
                    </h1>
                    <p>
                      ผู้ขอใช้บริการประเภทลูกค้าตกลงใช้บริการสำรองที่นั่ง
                      สิทธิ์การเข้าร่วมกิจกรรม
                      สั่งอาหารหรือเครื่องดื่มล่วงหน้าจากผู้ขอใช้บริการประเภทร้านค้าที่ให้บริการ
                      ภายใต้แพลตฟอร์ม rushbooking
                      ตามที่ได้รับอนุมัติจากเว็บไซต์และตามรายละเอียดการให้บริการที่เว็บไซต์กำหนด
                      โดยผู้ขอใช้บริการตกลงผูกพันตามข้อกำหนดและเงื่อนไข
                      ดังต่อไปนี้
                    </p>
                    <p>1. คำนิยาม</p>
                    <p>
                      1.1 “เว็บไซต์” หมายความถึง เว็บไซต์ www.rushbooking.co
                      และให้หมายความรวมถึงบุคคลที่เว็บไซต์มอบหมายด้วย
                    </p>
                    <p>
                      1.2 “ลูกค้า” หมายความถึง
                      ผู้ขอใช้บริการประเภทบุคคลธรรมดาที่ประสงค์สำรองที่นั่ง
                      สิทธิ์การเข้าร่วมกิจกรรม
                      สั่งอาหารหรือเครื่องดื่มล่วงหน้าจากร้านค้า
                      โดยการทำรายการการใช้บริการผ่านแพลตฟอร์มตามที่เว็บไซต์กำหนด
                    </p>
                    <p>
                      1.3 “ร้านค้า” หมายถึง ผู้ขอใช้บริการ
                      ประเภทบุคคลธรรมดาหรือนิติบุคคลที่ใช้บริการกับเว็บไซต์
                      ผ่านแพลตฟอร์มในส่วนของร้านค้า ซึ่งมีหน้าที่สำรองที่นั่ง
                      สิทธิ์การเข้าร่วมกิจกรรม
                      สั่งอาหารหรือเครื่องดื่มล่วงหน้าให้แก่ลูกค้า
                    </p>
                    <p>
                      1.4 “แพลตฟอร์ม” หมายความถึง
                      แพลตฟอร์มให้บริการเกี่ยวกับการสำรองที่นั่ง
                      สิทธิ์การเข้าร่วมกิจกรรม สั่งอาหารหรือเครื่องดื่มล่วงหน้า
                      การชำระเงิน การรับรายการบริการอื่น ๆ ให้แก่ลูกค้า
                      และร้านค้า ซึ่งแพลตฟอร์มดังกล่าวมีทั้งที่เป็นเว็บไซต์
                      และ/หรือช่องทางอื่นใดตามที่เว็บไซต์กำหนดเพิ่มเติมในภายหน้า
                    </p>
                    <p>
                      1.5 “รายการการใช้บริการ” หมายความถึง คำสั่ง หรือรายการ
                      หรือธุรกรรมต่าง ๆ เกี่ยวกับการใช้บริการผ่านแพลตฟอร์ม เช่น
                      การสำรองที่นั่ง การสำรองสิทธิ์เข้าร่วมกิจกรรม
                      การทำรายการสั่งอาหาร การชำระเงิน เป็นต้น
                    </p>
                    <p>
                      1.6 “รายการสั่งอาหารและเครื่องดื่ม” หมายความถึง
                      รายการอาหารและเครื่องดื่มที่ลูกค้าเป็นผู้ทำรายการผ่านแพลตฟอร์ม
                    </p>
                    <p>
                      1.7 “เหตุสุดวิสัย” หมายความถึง เหตุใด ๆ
                      อันอยู่นอกเหนือการควบคุมของเว็บไซต์
                      ซึ่งเป็นอุปสรรคต่อการให้บริการตามข้อกำหนดและเงื่อนไขนี้
                      รวมถึงเป็นเหตุให้เกิดข้อขัดข้อง หรือข้อมูลผิดพลาด เช่น
                      ระบบคอมพิวเตอร์ของเว็บไซต์
                      หรือระบบสื่อสารขัดข้องเพราะกระแสไฟฟ้าขัดข้อง
                      การกระทำของบุคคลภายนอก เป็นต้น
                    </p>
                    <p>
                      1.8 “อาหารและเครื่องดื่ม” หมายความถึง อาหาร ขนม
                      เครื่องดื่ม ของกิน และ/หรือ สิ่งที่บริโภคได้
                    </p>
                    <p>
                      1.9 “กิจกรรม” หมายความถึง
                      กิจกรรมที่ทางร้านค้าเป็นผู้จัดขึ้น และ/หรือร่วมจัด
                    </p>
                    <p>2. การใช้บริการและผลผูกพันลูกค้า</p>
                    <p>
                      2.1 ลูกค้ารับทราบว่า
                      เว็บไซต์เป็นผู้ให้บริการแพลตฟอร์มเท่านั้น
                      ไม่ได้ทำหน้าที่หรือเป็นตัวแทนของบุคคลใด นอกจากนี้
                      เว็บไซต์มิใช่คู่สัญญาในการสำรองที่นั่ง
                      สำรองสิทธิ์เข้าร่วมกิจกรรม
                      สั่งอาหารและเครื่องดื่มระหว่างลูกค้ากับร้านค้า
                    </p>
                    <p>
                      2.2 ลูกค้าจะต้องใช้โทรศัพท์มือถือ และ/หรือ แท็บเล็ต
                      และ/หรือ
                      เครื่องมืออื่นใดที่มีคุณสมบัติและระบบปฏิบัติการตามที่เว็บไซต์กำหนดเพื่อทำรายการการใช้บริการ
                    </p>
                    <p>
                      2.3
                      ลูกค้าตกลงใช้บริการผ่านแพลตฟอร์มตามขั้นตอนและวิธีการที่เว็บไซต์กำหนด
                      ทั้งนี้ ลูกค้าจะต้องลงทะเบียนสร้างบัญชี
                      เพื่อขอใช้แพลตฟอร์มก่อน โดยลูกค้าจะต้องมีอายุไม่ต่ำกว่า 20
                      ปี หรือบรรลุนิติภาวะ กรณีอายุต่ำกว่าที่กำหนด
                      ทางแพลตฟอร์มขอสงวนสิทธิ์การให้บริการโดยเด็ดขาด
                      และไม่รับผิดชอบต่อการกระทำผิดกฎหมายที่เกี่ยวข้อง
                    </p>
                    <p>
                      2.4 รายการการใช้บริการ และ/หรือ การดำเนินการใด ๆ
                      ผ่านแพลตฟอร์มที่ทำขึ้น ให้ถือว่ามีผลใช้บังคับโดยถูกต้อง
                      สมบูรณ์ ผูกพัน
                      ถือเป็นการดำเนินการโดยชอบและใช้บังคับได้ตามกฎหมาย
                      และถือเป็นหลักฐานแห่งธุรกรรมอิเล็กทรอนิกส์และสามารถใช้เป็นต้นฉบับเพื่อเป็นพยานหลักฐานหรือใช้เป็นพยานหลักฐานในรูปแบบอื่นใดในกระบวนพิจารณาใด
                      ๆ ภายใต้บังคับแห่งกฎหมายได้
                    </p>
                    <p>
                      ทั้งนี้ เว็บไซต์ไม่ต้องสอบถามไปยังลูกค้า
                      หรือตรวจสอบความถูกต้อง อำนาจ หรือตัวตนของลูกค้า
                      รวมทั้งไม่ต้องตรวจสอบข้อมูล และ/หรือ รายละเอียดใด ๆ
                      ที่เกี่ยวข้องกับรายการการใช้บริการในครั้งนั้น ๆ
                      ว่าถูกต้องครบถ้วนหรือไม่ และลูกค้า ไม่ต้องทำ และ/หรือ
                      ลงนามในเอกสารอื่นใดอีก
                      เว้นแต่เว็บไซต์จะกำหนดไว้เป็นอย่างอื่นโดยชัดแจ้ง
                    </p>
                    <p>
                      2.5 ในการสำรองที่นั่ง สำรองสิทธิ์เข้าร่วมกิจกรรม
                      สั่งอาหารและเครื่องดื่มแต่ละครั้ง
                      ลูกค้าต้องตรวจสอบข้อมูลที่อยู่ในการสำรองที่นั่ง
                      รายการสั่งอาหารและเครื่องดื่ม รายการชำระเงิน ส่วนลด
                      (ถ้ามี) และข้อมูลอื่นใดในหน้าจอก่อนทำการยืนยันรายการ
                      เมื่อลูกค้ายืนยันรายการแล้ว
                      จะต้องชำระเงินผ่านระบบชำระเงินของแพลตฟอร์ม
                      กรณีต้องการเปลี่ยนแปลง
                      หรือยกเลิกรายการใช้บริการสามารถติดต่อตามช่องทาง
                      และเงื่อนไขตามที่เว็บไซต์กำหนด
                    </p>
                    <p>
                      2.6 เมื่อเว็บไซต์ยืนยันรายการใช้บริการ
                      รายการสั่งอาหารและเครื่องดื่มจากลูกค้าแก่ร้านค้า
                      ร้านค้ามีหน้าที่ดำเนินการสำรองที่นั่ง
                      สำรองสิทธิ์เข้าร่วมกิจกรรม
                      และจัดเตรียมอาหารและเครื่องดื่มแก่ลูกค้า
                      โดยเมื่อครบกำหนดระยะเวลา
                      เว็บไซต์จะดำเนินการสรุปยอดและโอนค่าบริการสำรองที่นั่ง
                      สิทธิ์เข้าร่วมกิจกรรม อาหารและเครื่องดื่มแก่ร้านค้า
                      โดยหักค่าบริการ ค่าใช้จ่าย และ/หรือ ค่าธรรมเนียมใดๆ
                      ตามที่กำหนด
                    </p>
                    <p>
                      2.7 เว็บไซต์จัดเก็บค่าบริการ ค่าใช้จ่าย และ/หรือ
                      ค่าธรรมเนียมใดๆ สำหรับการใช้แพลตฟอร์ม
                      โดยจัดเก็บจากแก่ร้านค้า ทั้งนี้ หากเว็บไซต์จัดเก็บ
                      หรือเปลี่ยนแปลงค่าบริการ ค่าใช้จ่าย และ/หรือ
                      ค่าธรรมเนียมใด ๆ จากลูกค้าและร้านค้า เว็บไซต์ตกลงว่า
                      เว็บไซต์จะต้องแจ้งให้ลูกค้าทราบล่วงหน้า
                    </p>
                    <p>2. การใช้บริการและผลผูกพันร้านค้า</p>
                    <p>
                      2.1 ร้านค้ารับทราบว่า
                      แพลตฟอร์มเป็นผู้ให้บริการอำนวยความสะดวกในการให้บริการของร้านค้า
                      ไม่ได้ทําหน้าที่หรือเป็นตัวแทนของบุคคลใด
                      นอกจากนี้ยังมิใช่คู่สัญญาในการสำรองที่นั่ง
                      สำรองสิทธิ์เข้าร่วมกิจกรรม
                      สั่งอาหารและเครื่องดื่มระหว่างร้านค้ากับลูกค้า ทั้งนี้
                      ร้านค้ามิต้องลงนามในเอกสารอื่นใดอีก
                      เว้นแต่แพลตฟอร์มจะกําหนดไว้เป็นอย่างอื่นโดยชัดแจ้ง
                    </p>
                    <p>
                      2.2
                      ร้านค้าตกลงใช้บริการผ่านแพลตฟอร์มตามขั้นตอนและวิธีการที่แพลตฟอร์มกําหนด
                      โดยในการใช้บริการ ในแต่ละคราว
                      ร้านค้าตกลงให้ผู้ใช้งานเป็นผู้ทํารายการการใช้บริการผ่านแพลตฟอร์ม{' '}
                    </p>
                    <p>
                      2.3 รายการการใช้บริการ ให้ถือว่ามีผลใช้บังคับโดยสมบูรณ์
                      ผูกพันร้านค้าและเป็นการดําเนินการโดยชอบ
                      สามารถใช้บังคับได้ตามกฎหมาย
                      และถือเป็นหลักฐานแห่งธุรกรรมอิเล็กทรอนิกส์และสามารถใช้เป็นต้นฉบับเพื่อเป็นพยานหลักฐานหรือใช้เป็นพยานหลักฐานในรูปแบบอื่นใดในกระบวนพิจารณาใด
                      ๆ ภายใต้บังคับแห่งกฎหมายได้
                      โดยที่แพลตฟอร์มไม่ต้องสอบถามไปยังร้านค้า
                      หรือตรวจสอบความถูกต้อง รวมทั้งไม่ต้องตรวจสอบข้อมูล
                      และ/หรือ รายละเอียดใด ๆ ที่เกี่ยวข้องกับรายการการใช้บริการ
                      ว่าถูกต้องครบถ้วนหรือไม่{' '}
                    </p>
                    <p>
                      2.4 ข้อมูลร้านค้าของร้านค้า
                      ซึ่งรวมถึงแต่ไม่จํากัดเฉพาะข้อมูลอาหารเครื่องดื่ม
                      ราคาอาหารเครื่องดื่ม การทํารายการส่งเสริมการขายต่าง ๆ
                      และข้อมูลอื่นใดที่ปรากฏบนแพลตฟอร์ม เป็นข้อมูลที่ถูกต้อง
                      ครบถ้วน และเป็นจริงทุกประการ รวมทั้งไม่โฆษณาเกินจริง
                      นอกจากนี้ <br />{' '}
                      ราคาอาหารหรือเครื่องดื่มจะต้องตํ่ากว่าหรือเท่ากับที่หน้าร้านของร้านค้ากําหนด
                      ราคาไว้รวมทั้งปริมาณและคุณภาพของอาหารต้องเท่ากัน
                    </p>
                    <p>
                      2.5 ข้อความ รูปภาพ หรือข้อมูลใด ๆ
                      ของร้านค้าที่ปรากฏบนแพลตฟอร์มจะต้องไม่ละเมิดลิขสิทธิ์
                      ไม่กระทำผิดกฎหมายที่เกี่ยวข้อง
                    </p>
                    <p>
                      2.6 ร้านค้าตกลงให้แพลตฟอร์มเป็นผู้รับชําระเงินจากลูกค้า
                      และยินยอมให้แพลตฟอร์มหักเงิน ค่าบริการ ค่าใช้จ่าย
                      ค่าธรรมเนียม และภาษี (ถ้ามี) รวมถึงค่ารายการส่งเสริมการขาย
                      ให้แล้วเสร็จก่อน
                      แล้วจึงโอนเงินส่วนที่เหลือเข้าบัญชีรับเงินของร้านค้า
                      ตามที่ร้านค้าแจ้งแก่แพลตฟอร์ม
                      โดยแพลตฟอร์มจะโอนเงินดังกล่าวให้แก่ร้านค้า ภายในระยะเวลา 1
                      วันทําการนับจากวันที่ลูกค้าทํารายการชําระเงิน
                      หรือภายในระยะเวลาอื่นใดตามที่แพลตฟอร์มกําหนดเพิ่มเติมในภายหน้า
                    </p>
                    <p>
                      2.7
                      ในกรณีที่ร้านค้าแจ้งการเปลี่ยนแปลงบัญชีรับเงินตามขั้นตอน
                      และวิธีการที่แพลตฟอร์มกำหนด
                      โดยข้อกําหนดและเงื่อนไขนี้มีผลใช้บังคับสําหรับบัญชีรับเงินที่ได้เปลี่ยนแปลงทุกประการ{' '}
                    </p>
                    <p>
                      2.8 แพลตฟอร์มมีสิทธิกําหนด เพิ่มเติม หรือเปลี่ยนแปลง
                      อัตราการคิดค่าธรรมเนียม ค่าบริการ หรือ ค่าใช้จ่ายใดๆ
                      อย่างใดเมื่อใดก็ได้
                      โดยแพลตฟอร์มจะแจ้งให้ร้านค้าทราบเป็นคราวๆ ไป{' '}
                    </p>
                    <p>
                      2.9 แพลตฟอร์มจะส่งใบเสร็จรับเงิน ใบกํากับภาษี
                      และเอกสารทางภาษีอื่นใดให้แก่ร้านค้าทางอีเมลที่ผู้ขอใช้บริการได้ให้ไว้กับแพลตฟอร์มตามคําขอใช้บริการ
                      และ/หรือ ช่องทางอิเล็กทรอนิกส์อื่นใดตามที่ กําหนด
                    </p>
                    <p>3. สิทธิในทรัพย์สินทางปัญญา</p>
                    <p>
                      ลูกค้า และร้านค้าตกลงยอมรับว่า แพลตฟอร์ม
                      รวมถึงระบบอิเล็กทรอนิกส์และข้อมูลที่อยู่บนแพลตฟอร์มได้รับความคุ้มครองโดยกฎหมายลิขสิทธิ์
                      และ/หรือ กฎหมายใด ๆ เกี่ยวกับทรัพย์สินทางปัญญา ทั้งนี้
                      เว็บไซต์ยังคงเป็นเจ้าของลิขสิทธิ์ ทรัพย์สินทางปัญญา สิทธิ
                      และ/หรือ ผลประโยชน์ทั้งหลายทั้งปวงในแพลตฟอร์ม
                    </p>
                    <p>
                      อนึ่ง การที่ลูกค้า และร้านค้าได้รับสิทธิในการใช้แพลตฟอร์ม
                      มิได้ถือเป็นการโอนกรรมสิทธิ์หรือสิทธิใด ๆ
                      ในแพลตฟอร์มให้แก่ลูกค้า และร้านค้าในกรณีมีการกระทำใด ๆ
                      กับแพลตฟอร์ม หรือมีการอ้างอิง
                      หรือใช้ข้อมูลจากแพลตฟอร์มโดยมิได้รับอนุญาตหรือมิชอบด้วยกฎหมาย
                      ลูกค้า และร้านค้าตกลงรับผิดชอบต่อเว็บไซต์
                    </p>
                    <p>4. ข้อตกลงทั่วไป</p>
                    <p>
                      4.1 ลูกค้า
                      และร้านค้าตกลงว่าจะไม่ใช้แพลตฟอร์มเพื่อวัตถุประสงค์อื่นใดนอกเหนือจากวัตถุประสงค์ของบริการนี้เท่านั้น
                    </p>
                    <p>
                      4.2 ลูกค้า และร้านค้าจะไม่กระทำการอย่างใดอย่างหนึ่ง
                      รวมถึงไม่ยินยอมให้บุคคลอื่นกระทำการอย่างใดอย่างหนึ่ง
                      ดังต่อไปนี้ด้วย
                    </p>
                    <p>
                      4.2.1 ส่ง ไวรัส วอร์ม ม้าโทรจัน (Trojan horses)
                      หรือโปรแกรมอื่นใดซึ่งมีสถานะในการทำลายเข้าแพลตฟอร์ม
                    </p>
                    <p>
                      4.2.2 ลอกเลียน แก้ไข แยก วิศวกรรมย้อนกลับ
                      หรือเปลี่ยนแปลงแพลตฟอร์มหรือข้อมูลของเว็บไซต์
                    </p>
                    <p>
                      4.2.3 ใช้หุ่นยนต์ สไปเดอร์ (Spiders) คลอว์เลอส์ (Crawlers)
                      สเครปปิ้ง (Scraping)
                      หรือเทคโนโลยีที่คล้ายกันเพื่อเข้าถึงแพลตฟอร์มหรือระบบอิเล็กทรอนิกส์ของเว็บไซต์หรือเพื่อให้ได้มาซึ่งข้อมูลของเว็บไซต์นอกเหนือจากข้อกำหนดและเงื่อนไขนี้
                    </p>
                    <p>
                      4.3 กรณีส่วนใดส่วนหนึ่งของข้อกำหนดและเงื่อนไขนี้เป็นโมฆะ
                      ไม่ชอบด้วยกฎหมาย ไม่มีผลบังคับใช้ได้ตามกฎหมาย
                      หรือไม่สมบูรณ์ด้วยประการใด
                      ให้ข้อกำหนดและเงื่อนไขส่วนอื่นยังคงมีผลสมบูรณ์และบังคับใช้ได้ตามกฎหมายต่อไป
                    </p>
                    <p>
                      5. การระงับการให้บริการชั่วคราวและการยกเลิกการให้บริการ
                    </p>
                    <p>
                      5.1
                      เว็บไซต์มีสิทธิในการระงับการให้บริการชั่วคราวเพื่อการปรับปรุงหรือพัฒนาบริการหรือแพลตฟอร์ม
                      หรือด้วยเหตุอื่นใดที่เว็บไซต์เห็นสมควร
                      ตามระยะเวลาที่เว็บไซต์กำหนด หรือเปลี่ยนแปลงวัน และ/หรือ
                      เวลา และ/หรือ รายละเอียดในการให้บริการ และ/หรือ
                      ประเภทบริการ เมื่อใดก็ได้
                    </p>
                    <p>
                      5.2 เว็บไซต์มีสิทธิระงับหรือยกเลิกการให้บริการเมื่อใดก็ได้
                      โดยแจ้งให้ลูกค้า และร้านค้าทราบล่วงหน้าไม่น้อยกว่า 7 วัน
                      เว้นแต่ในกรณีหนึ่งกรณีใดต่อไปนี้
                      เว็บไซต์มีสิทธิระงับหรือยกเลิกการให้บริการได้ทันที
                      โดยไม่จำต้องบอกกล่าวแก่ลูกค้า และร้านค้า
                    </p>
                    <p>
                      5.2.1 ลูกค้า
                      และร้านค้าผิดคำรับรองหรือผิดเงื่อนไขตามข้อกำหนดและเงื่อนไขนี้
                    </p>
                    <p>
                      5.2.2 ข้อมูลที่ลูกค้า
                      และร้านค้าได้ให้ไว้แก่เว็บไซต์หรือในแพลตฟอร์มไม่ถูกต้อง
                      ครบถ้วน หรือไม่ตรงตามข้อเท็จจริง
                    </p>
                    <p>
                      5.2.3 ลูกค้า และร้านค้าใช้ข้อความที่ไม่สุภาพ หยาบคาย
                      เข้าข่ายผิดกฎหมาย
                      หรือข้อความใดที่ผิดวัตถุประสงค์ของบริการนี้
                    </p>
                    <p>
                      5.2.4
                      เว็บไซต์สงสัยหรือเห็นว่ามีพฤติการณ์น่าเชื่อว่ามีการใช้บริการที่อาจผิดกฎหมาย
                      หรือผิดกฎเกณฑ์ข้อบังคับใดที่ใช้กับธุรกรรมนั้น
                      หรือโดยทุจริตหรือโดยมิชอบไม่ว่าด้วยประการใด ๆ
                      และไม่ว่าจะเป็นการกระทำของบุคคลใดก็ตาม
                    </p>
                    <p>
                      5.2.5
                      ลูกค้าและร้านค้ากระทำการโดยจงใจหรือประมาทเลินเล่ออันส่งผลให้มีการปล่อยไวรัสซอฟต์แวร์
                      หรือ โปรแกรมรบกวนอื่น ๆ เข้าสู่แพลตฟอร์ม หรือกระทำการใด ๆ
                      ที่รบกวนหรือทำให้บุคคลอื่นไม่สามารถใช้บริการของเว็บไซต์หรือไม่สามารถใช้แพลตฟอร์มได้ตามปกติ
                      หรือส่งผลกระทบต่อประสิทธิภาพการให้บริการตามปกติหรือแพลตฟอร์ม
                    </p>
                    <p>
                      5.2.6 ลูกค้า และร้านค้าเสียชีวิต หรือสาบสูญ
                      หรือตกเป็นผู้ไร้ความสามารถ หรือเสมือนไร้ความสามารถ
                      หรือตกเป็นบุคคลล้มละลาย
                      หรือถูกพิทักษ์ทรัพย์ไม่ว่าชั่วคราวหรือเด็ดขาด
                      หรือมีหนี้สินล้นพ้นตัว
                    </p>
                    <p>
                      5.2.7 เว็บไซต์ต้องปฏิบัติตามกฎหมาย กฎเกณฑ์
                      หรือคำสั่งของศาล พนักงานสอบสวน เจ้าหน้าที่รัฐ
                      หน่วยงานทางการ หรือหน่วยงานใด ๆ ที่มีอำนาจ
                    </p>
                    <p>
                      5.2.8
                      ความจำเป็นอื่นใดซึ่งเว็บไซต์เห็นว่าไม่อาจแจ้งล่วงหน้าได้
                    </p>
                    <p>
                      5.3 การระงับการให้บริการ
                      หรือการยกเลิกการให้บริการหรือการใช้บริการ
                      ไม่ทำให้สิทธิและหน้าที่ทั้งหลายตามการใช้บริการหรือรายการการใช้บริการที่มีผลบังคับแล้วนั้นสิ้นสุดลง
                      โดยยังคงมีผลผูกพันลูกค้า ร้านค้า
                      และเว็บไซต์อย่างสมบูรณ์ต่อไปจนกว่าจะได้มีการดำเนินการดังกล่าวจนครบถ้วน
                    </p>
                    <p>6. ความรับผิดและข้อยกเว้นความรับผิด</p>
                    <p>
                      6.1 บรรดาการกระทำใดๆ
                      ที่เว็บไซต์ได้กระทำไปตามรายการการใช้บริการ และ/หรือ
                      ตามข้อมูลที่ลูกค้า และร้านค้าได้แจ้งต่อเว็บไซต์ และ/หรือ
                      ตามคำร้องขอของลูกค้า และร้านค้า และ/หรือ
                      ตามข้อกำหนดและเงื่อนไขการใช้บริการใด ๆ
                      ของเว็บไซต์ไม่ว่าที่มีอยู่แล้วในขณะนี้หรือที่จะมีขึ้นในภายหน้า
                      ให้มีผลผูกพันลูกค้า และร้านค้าทุกประการ
                      โดยเว็บไซต์ไม่ต้องรับผิดชอบในความเสียหายใด ๆ
                      อันเกิดขึ้นแก่ลูกค้า
                      และร้านค้าอันเนื่องมาจากการใช้บริการของเว็บไซต์
                      เว้นแต่เกิดจากเว็บไซต์จงใจกระทำความผิด
                      หรือประมาทเลินเล่ออย่างร้ายแรง
                    </p>
                    <p>
                      6.2 ลูกค้า และร้านค้าตกลงและยอมรับว่า
                      เว็บไซต์ไม่ต้องรับผิดชอบในความผิดพลาด ความบกพร่อง
                      หรือเหตุขัดข้องในการใช้บริการ อันเนื่องมาจากเหตุสุดวิสัย
                      หรือเหตุอื่นใดที่อยู่นอกเหนือการควบคุมของเว็บไซต์
                      นอกจากนี้
                      เว็บไซต์จะไม่รับผิดชอบสำหรับความเสียหายที่เกิดโดยทางอ้อม
                      รวมถึงการสูญเสียรายได้จากการใช้งาน ผลกำไร ข้อมูล ธุรกิจ
                    </p>
                    <p>
                      6.3 หากเกิดความเสียหายใด ๆ แก่เว็บไซต์
                      อันเนื่องมาจากการให้บริการนี้
                      ลูกค้าและร้านค้าตกลงยินยอมรับผิดชอบชดใช้ค่าเสียหายต่าง ๆ
                      ที่เกิดขึ้นทั้งหมดให้แก่เว็บไซต์
                    </p>
                    <p>
                      6.4 กรณีลูกค้า และร้านค้าแอบอ้างเว็บไซต์โดยไม่รับอนุญาต
                      ทางเว็บไซต์ขอสงวนสิทธิ์การให้บริการ โดยลูกค้า
                      และร้านค้ายินยอมรับผิดชอบชดใช้ค่าเสียหายต่าง ๆ
                      ที่เกิดขึ้นทั้งหมด
                    </p>
                    <p>7. การเก็บรวบรวม ใช้ และเปิดเผยข้อมูล</p>
                    <p>
                      7.1 เว็บไซต์อาจมีการจัดเก็บ บันทึก
                      ประมวลผลข้อมูลเกี่ยวกับลูกค้าและร้านค้า รายการการใช้บริการ
                      หรือ การดำเนินการใด ๆ
                      ที่เกี่ยวข้องกับการใช้บริการของลูกค้า และร้านค้า
                      เพื่อประโยชน์ในการปรับปรุงและให้บริการของเว็บไซต์
                      เพื่อเป็นหลักฐานการบริการและรายการการใช้บริการ ทั้งนี้
                      ลูกค้าและร้านค้าตกลงให้ใช้ข้อมูลดังกล่าวเป็นพยานหลักฐานอ้างอิงต่อลูกค้าและร้านค้าได้ตามกฎหมาย
                      โดยลูกค้าและร้านค้าจะไม่โต้แย้งแต่ประการใดทั้งสิ้น
                      แต่ทั้งนี้
                      เว็บไซต์ไม่มีหน้าที่ต้องบันทึกหรือเก็บรักษาข้อมูลดังกล่าว
                    </p>
                    <p>
                      7.2 ลูกค้าและร้านค้ายินยอมให้เว็บไซต์เก็บรวบรวม ใช้
                      ข้อมูลส่วนบุคคล ข้อมูลรายการการใช้บริการ
                      ข้อมูลการทำธุรกรรม ข้อมูลใด ๆ
                      ของลูกค้าและร้านค้าที่ให้ไว้แก่เว็บไซต์
                      หรือที่เว็บไซต์ได้รับ หรือเข้าถึงได้จากแหล่งอื่น
                      เพื่อวัตถุประสงค์ในการวิเคราะห์ข้อมูล
                      การบริหารกิจการของเว็บไซต์ เสนอ ให้ ใช้
                      ปรับปรุงบริการของเว็บไซต์ ของบุคคลที่เป็นผู้จำหน่าย
                      เป็นตัวแทน หรือมีความเกี่ยวข้องกับเว็บไซต์
                      เพื่อตรวจสอบรายการธุรกรรมที่อาจจะเกิดการทุจริต
                      ธุรกรรมที่มีเหตุอันควรสงสัย
                      เพื่อวัตถุประสงค์อื่นใดที่ไม่ต้องห้ามตามกฎหมาย
                      เพื่อปฏิบัติตามกฎหมายหรือกฎระเบียบของประเทศใด ๆ
                      ที่ใช้บังคับกับเว็บไซต์ รวมทั้งยินยอมให้เว็บไซต์ส่ง โอน
                      เปิดเผยข้อมูลดังกล่าวให้แก่ผู้รับโอนสิทธิเรียกร้อง
                      พันธมิตรทางธุรกิจ นิติบุคคลหรือบุคคลใด ๆ
                      ที่เว็บไซต์เป็นคู่สัญญาหรือมีความสัมพันธ์ด้วย
                    </p>
                    <p>
                      7.3 เพื่อประโยชน์ของลูกค้าและร้านค้า
                      เว็บไซต์อาจส่งข้อมูลข่าวสารในเชิงพาณิชย์ เช่น
                      ข้อมูลผลิตภัณฑ์และบริการต่าง ๆ ข้อมูลทางการตลาด
                      และรายการส่งเสริมการขาย เป็นต้น
                      ไปยังที่อยู่อิเล็กทรอนิกส์ต่าง ๆ และหมายเลขโทรศัพท์มือถือ
                      เป็นต้น
                      โดยลูกค้าและร้านค้าสามารถบอกเลิกหรือปฏิเสธการรับข้อมูลดังกล่าวได้ตามช่องทางที่เว็บไซต์กำหนด
                    </p>
                    <p>
                      8. การปฏิบัติตามระเบียบ คู่มือ
                      ข้อกำหนดและเอกสารเกี่ยวกับการใช้บริการของเว็บไซต์
                    </p>
                    <p>
                      8.1 ลูกค้า และร้านค้าตกลงยอมรับผูกพันและปฏิบัติตามระเบียบ
                      ข้อกำหนดและเงื่อนไข รวมถึงคู่มือ
                      และเอกสารอธิบายวิธีการใช้บริการตามที่เว็บไซต์กำหนด
                      ซึ่งลูกค้าและร้านค้าได้รับทราบแล้ว
                      รวมทั้งตามที่เว็บไซต์จะได้กำหนดเพิ่มเติม แก้ไข
                      หรือเปลี่ยนแปลงในภายหน้าและแจ้งให้ลูกค้าและร้านค้าทราบ
                      โดยลงประกาศเป็นการทั่วไปบนแพลตฟอร์ม หรือเว็บไซต์
                      หรือเว็บไซต์อื่นที่เว็บไซต์จะได้กำหนดหรือเปลี่ยนแปลงในภายหน้า
                      (ถ้ามี) หรือโดยวิธีการอื่นใดที่เว็บไซต์จะได้กำหนดเพิ่มเติม
                    </p>
                    <p>
                      8.2 ลูกค้า และร้านค้าตกลงว่า
                      การที่เว็บไซต์นำข้อกำหนดและเงื่อนไขการใช้บริการไปประกาศบนแพลตฟอร์ม
                      และ/หรือ เว็บไซต์ของเว็บไซต์ และ/หรือ
                      เว็บไซต์อื่นที่เว็บไซต์จะได้กำหนดหรือเปลี่ยนแปลงในภายหน้า
                      (ถ้ามี) นั้น เป็นวิธีการที่เหมาะสมและเป็นที่ยอมรับได้
                      และตกลงว่าในทุกครั้งที่มีการเข้าใช้บริการหรือทำรายการการใช้บริการนั้น
                      ลูกค้าและร้านค้าได้ยอมรับข้อกำหนดและเงื่อนไขการใช้บริการดังกล่าวแล้ว
                    </p>
                    <p>9. การส่งคำบอกกล่าว</p>
                    <p>
                      คำบอกกล่าว เอกสาร หนังสือ หรือข้อมูลใด ๆ
                      ที่เว็บไซต์ได้ส่งไปยังลูกค้าและร้านค้า ทางหมายเลขโทรศัพท์
                      อีเมล ตามที่ลูกค้าและร้านค้าได้ให้ไว้กับเว็บไซต์
                      หรือตามที่เว็บไซต์ได้รับแจ้งแก้ไขเปลี่ยนแปลงแล้ว
                      โดยทางไปรษณีย์ ข้อความ SMS อีเมล
                      หรือการสื่อสารทางอิเล็กทรอนิกส์อื่นใดให้ถือว่าได้ส่งให้ลูกค้าและร้านค้าแล้วโดยชอบ{' '}
                    </p>
                    <p>
                      ลูกค้าและร้านค้าได้ทราบถึงคำบอกกล่าว เอกสาร หนังสือ
                      หรือข้อมูลนั้น ๆ แล้ว และบรรดาคำบอกกล่าว เอกสาร หนังสือ
                      หรือข้อมูลใด ๆ
                      ที่เว็บไซต์ได้รับจากลูกค้าและร้านค้าให้ถือว่าเป็นคำบอกกล่าว
                      เอกสาร หนังสือ
                      หรือข้อมูลของลูกค้าและร้านค้าที่ถูกต้องแท้จริง
                      เป็นไปตามความประสงค์โดยถูกต้องของลูกค้า และร้านค้า
                      โดยมีผลผูกพันลูกค้า และร้านค้าทุกประการ
                    </p>
                    <p>10. กฎหมายที่ใช้บังคับ</p>
                    <p>
                      การใช้บริการนี้อยู่ในบังคับและการตีความตามกฎหมายไทย
                      ข้อพิพาทใด ๆ ที่เกิดขึ้นจากหรือเกี่ยวกับการใช้บริการ
                      ให้อยู่ในอำนาจการพิจารณาของศาลไทย
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={PDPA} as={Fragment}>
        <Dialog
          as='div'
          static
          className='relative z-10'
          onClose={() => {
            setPDPAModalOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed z-10 inset-0 overflow-y-auto'>
            <div className='flex items-center sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5'>
                  <div className='flex flex-col h-96 space-y-3'>
                    <p>ประกาศความเป็นความส่วนตัว (Privacy Notice)</p>
                    <p>ฉบับลงวันที่ 1 พฤศจิกายน พ.ศ. 2565</p>
                    <p>
                      ทางทีมงานของเว็บไซต์ www.rushbooking.co
                      ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน
                      ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                      ในการเก็บรวบรวม การใช้ และ/หรือ
                      เปิดเผยข้อมูลส่วนบุคคลในระหว่างการใช้บริการเว็บไซต์
                      และเพื่อวัตถุประสงค์ด้านบริการแพลตฟอร์มบริการการสำรองที่นั่ง
                      สำรองสิทธิ์เข้าร่วมกิจกรรม สั่งซื้ออาหารและเครื่องดื่ม
                      โดยประกาศความเป็นส่วนตัวฉบับนี้มีผลใช้บังคับตั้งแต่วันที่
                      1 พฤศจิกายน พ.ศ. 2565
                    </p>
                    <p>
                      ประกาศความเป็นส่วนตัวฉบับนี้ (“ประกาศ”)
                      จะแจ้งให้ท่านทราบเกี่ยวกับรายละเอียด ดังต่อไปนี้
                    </p>
                    <p className='pl-3'>- การเก็บรวบรวมข้อมูลส่วนบุคคล</p>
                    <p className='pl-3'>- วัตถุประสงค์การใช้ข้อมูลส่วนบุคคล</p>
                    <p className='pl-3'>- การเปิดเผยข้อมูลส่วนบุคคล</p>
                    <p className='pl-3'>
                      - สิทธิของท่านที่มีต่อข้อมูลส่วนบุคคล
                      และการคุ้มครองตามกฎหมาย
                    </p>
                    <p>
                      เว็บไซต์จะเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน
                      โดยการลงทะเบียนสมาชิกผ่านช่องทางเว็บไซต์ อีเมล์, Facebook
                      Login ,Google Login, LINE Login, อื่น ๆ เป็นต้น
                    </p>
                    <p>
                      โดยอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่านจากแหล่งอื่น เช่น
                      เสิร์ชเอนจิน โซเชียลมีเดีย บุคคลภายนอกอื่น ๆ เป็นต้น{' '}
                    </p>
                    <p>1. การเก็บรวบรวมข้อมูลส่วนบุคคล</p>
                    <p>
                      ทางเว็บไซต์จะดำเนินการเก็บรวบรวม ใช้
                      หรือเปิดเผยข้อมูลส่วนบุคคลของท่านที่ได้รับโดยทางตรงหรือทางอ้อม
                      โดยจะพิจารณาถึง ข้อมูลดังต่อไปนี้
                    </p>
                    <p>
                      ข้อมูลส่วนบุคคล หมายความว่า
                      ข้อมูลเกี่ยวกับบุคคลซึ่งทำให้สามารถระบุตัวบุคคลนั้นได้ไม่ว่าทางตรงหรือทางอ้อม
                      ข้อมูลส่วนบุคคล เช่น ชื่อ นามสกุล อายุ วันเดือนปีเกิด
                      สัญชาติ เลขประจำตัวประชาชน เป็นต้น
                      โดยแบ่งเป็นหมวดหมู่ของข้อมูล ดังต่อไปนี้
                    </p>
                    <p className='pl-3'>
                      ข้อมูลการติดต่อ เช่น ที่อยู่ หมายเลขโทรศัพท์ อีเมล เป็นต้น
                    </p>
                    <p className='pl-3'>
                      ข้อมูลบัญชี เช่น บัญชีผู้ใช้งาน ประวัติการใช้งาน เป็นต้น
                    </p>
                    <p className='pl-3'>
                      หลักฐานแสดงตัวตน เช่น สำเนาบัตรประจำตัวประชาชน เป็นต้น
                    </p>
                    <p className='pl-3'>
                      ข้อมูลการทำธุรกรรมและการเงิน เช่น ประวัติการสั่งซื้อ
                      รายละเอียดบัตรเดบิต/เครดิต บัญชีธนาคาร เป็นต้น
                    </p>
                    <p className='pl-3'>
                      ข้อมูลทางเทคนิค เช่น IP address, Cookie ID,
                      ประวัติการใช้งานเว็บไซต์ (Activity Log) เป็นต้น
                    </p>
                    <p className='pl-3'>
                      ข้อมูลอื่น ๆ เช่น รูปภาพ ภาพเคลื่อนไหว
                      ข้อมูลอื่นใดที่ถือว่าเป็นข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                      พ.ศ. 2562
                    </p>
                    <p>2. การใช้ข้อมูลส่วนบุคคล</p>
                    <p>
                      ทางเว็บไซต์อาจเก็บรวบรวม ใช้ เปิดเผยข้อมูลส่วนบุคคล
                      ตามที่เห็นว่าเหมาะสมและมีความจำเป็นเพื่อให้เป็นไปตามวัตถุประสงค์
                      ดังต่อไปนี้
                    </p>
                    <p className='pl-3'>- เพื่อยืนยันบุคคล และการให้บริการ</p>
                    <p className='pl-3'>- เพื่อสร้างและจัดการบัญชีผู้ใช้งาน</p>
                    <p className='pl-3'>
                      - เพื่อบริการสำรองที่นั่ง สำรองสิทธิ์เข้าร่วมกิจกรรม
                      การสั่งซื้ออาหารและเครื่องดื่ม
                    </p>
                    <p className='pl-3'>
                      - เพื่อปรับปรุงบริการ หรือประสบการณ์การใช้งาน
                    </p>
                    <p className='pl-3'>- เพื่อการบริหารจัดการภายใน</p>
                    <p className='pl-3'>- เพื่อการตลาด และการส่งเสริมการขาย</p>
                    <p className='pl-3'>- เพื่อการบริการหลังการขาย</p>
                    <p className='pl-3'>- เพื่อรวบรวมข้อเสนอแนะ</p>
                    <p className='pl-3'>- เพื่อชำระค่าสินค้า หรือบริการ</p>
                    <p>3. การเปิดเผยข้อมูลส่วนบุคคล</p>
                    <p>
                      ทางเว็บไซต์อาจเปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่ผู้อื่นภายใต้ความยินยอมของท่านหรือที่กฎหมายได้กำหนดไว้
                      รวมถึง ในกรณีที่มีกฎหมายหรือหน่วยงานราชการร้องขอ
                      ทางเว็บไซต์จะเปิดเผยข้อมูลส่วนบุคคลของท่านเท่าที่จำเป็นให้แก่หน่วยงานราชการ
                      เช่น ศาล หน่วยงานราชการ เป็นต้น ตามรายละเอียดดังต่อไปนี้
                    </p>
                    <p>ผู้ให้บริการ</p>
                    <p>
                      ทางเว็บไซต์อาจเปิดเผยข้อมูลส่วนบุคคลของท่านบางอย่างให้กับผู้ให้บริการของทางเว็บไซต์เท่าที่จำเป็นเพื่อดำเนินงานในด้านต่าง
                      ๆ เช่น การชำระเงิน การตลาด การพัฒนาสินค้าหรือบริการ
                      เป็นต้น ทั้งนี้
                      ผู้ให้บริการมีนโยบายความเป็นส่วนตัวของตนเอง
                    </p>
                    <p>การบริหารจัดการภายในองค์กร</p>
                    <p>
                      ทางเว็บไซต์อาจเปิดเผยข้อมูลส่วนบุคคลของท่านเท่าที่จำเป็นเพื่อปรับปรุงและพัฒนาบริการของทางเว็บไซต์
                      โดยอาจรวบรวมข้อมูลภายในสำหรับบริการต่าง ๆ
                      ภายใต้นโยบายนี้เพื่อประโยชน์ของท่านและผู้อื่นมากขึ้น
                    </p>
                    <p>การโฆษณาและการตลาด</p>
                    <p>
                      เพื่อประโยชน์ในการได้รับบริการของทางเว็บไซต์
                      ทางเว็บไซต์ใช้ข้อมูลของท่านเพื่อวิเคราะห์และปรับปรุงสินค้าหรือบริการ
                      และทำการตลาดผ่าน Google, Facebook, และอื่น ๆ
                      ทางเว็บไซต์ใช้ข้อมูลดังกล่าวเพื่อให้บริการเหมาะสมกับท่าน
                    </p>
                    <p>
                      เว็บไซต์ของทางเว็บไซต์อาจแสดงโฆษณาจากบุคคลที่สามเพื่ออำนวยความสะดวกในการบริการของทางเว็บไซต์
                      เช่น Google AdSense
                      บุคคลที่สามเหล่านี้อาจเข้าถึงข้อมูลส่วนบุคคลของท่านเพื่อดำเนินการเหล่านี้เท่านั้น
                      และมีหน้าที่ไม่เปิดเผยหรือใช้เพื่อวัตถุประสงค์อย่างอื่น
                    </p>
                    <p>
                      ทางเว็บไซต์จะไม่ใช้ระบบการตัดสินใจอัตโนมัติ (automated
                      decision-making) โดยปราศจากการบุคคลกำกับดูแล
                      รวมถึงการทำโปรไฟล์ลิ่ง (profiling)
                      ในลักษณะที่ก่อให้เกิดผลกระทบกับท่านอย่างมีนัยสำคัญ
                    </p>
                    <p>
                      ทางเว็บไซต์อาจส่งข้อมูลหรือจดหมายข่าวไปยังช่องทางติดต่อของท่าน
                      โดยมีวัตถุประสงค์เพื่อเสนอสิ่งที่น่าสนกับท่าน
                      หากท่านไม่ต้องการรับการติดต่อสื่อสารจากทางเว็บไซต์ผ่านทางอีเมลอีกต่อไป
                      ท่านสามารถติดต่อมายังอีเมลของทางเว็บไซต์ได้
                    </p>
                    <p>เทคโนโลยีติดตามตัวบุคคล (Cookies)</p>
                    <p>
                      เพื่อเพิ่มประสบการณ์การใช้งานของท่านให้สมบูรณ์และมีประสิทธิภาพมากขึ้น
                      ทางเว็บไซต์ใช้คุกกี้ (Cookies)
                      หรือเทคโนโลยีที่คล้ายคลึงกัน เพื่อพัฒนาการเข้าถึงบริการ
                      โฆษณาที่เหมาะสม และติดตามการใช้งานของท่าน
                      การใช้คุกกี้เพื่อระบุและติดตามผู้ใช้งานเว็บไซต์และการเข้าถึงเว็บไซต์
                      หากท่านไม่ต้องการให้มีคุกกี้ไว้ในคอมพิวเตอร์ของท่าน
                      ท่านสามารถตั้งค่าบราวเซอร์เพื่อปฏิเสธคุกกี้ก่อนที่จะใช้เว็บไซต์ของทางเว็บไซต์ได้
                    </p>
                    <p>
                      ทางเว็บไซต์อาจเปิดเผยข้อมูลบางอย่างกับพันธมิตรทางธุรกิจ
                      เพื่อติดต่อและประสานงานในการให้บริการ
                      และให้ข้อมูลเท่าที่จำเป็นเกี่ยวกับความพร้อมใช้งานของสินค้าหรือบริการ
                    </p>
                    <p>การถ่ายโอนธุรกิจ</p>
                    <p>
                      ทางเว็บไซต์อาจเปิดเผยข้อมูล รวมถึงข้อมูลส่วนบุคคลของท่าน
                      สำหรับการปรับโครงสร้างองค์กร การควบรวมหรือการขายกิจการ
                      หรือการถ่ายโอนสินทรัพย์อื่น ๆ
                      โดยฝ่ายที่รับโอนต้องปฏิบัติกับข้อมูลของท่านในลักษณะที่สอดคล้องกับนโยบายนี้
                      รวมถึงกฎหมายคุ้มครองข้อมูลส่วนบุคคลด้วย
                    </p>
                    <p>4. การเก็บรักษาข้อมูลส่วนบุคคล</p>
                    <p>วิธีการเก็บรักษาข้อมูลส่วนบุคคล</p>
                    <p>
                      ทางเว็บไซต์จะเก็บรักษาข้อมูลส่วนบุคคลของท่านในรูปแบบเอกสารและรูปแบบอิเล็กทรอนิกส์
                      ผ่านทางผู้ให้บริการเซิร์ฟเวอร์บนระบบคลาวด์ในประเทศ
                      หรือต่างประเทศ
                      หรือตามความเหมาะสมภายใต้กฎหมายที่เกี่ยวข้องกับข้อมูลส่วนบุคคล
                    </p>
                    <p>ระยะเวลาจัดเก็บข้อมูลส่วนบุคคล</p>
                    <p>
                      ทางเว็บไซต์จะเก็บรักษาข้อมูลส่วนบุคคลของท่านไว้ตามระยะเวลาที่จำเป็นในระหว่างที่ท่านเป็นผู้ใช้งานหรือมีความสัมพันธ์อยู่กับทางเว็บไซต์
                      หรือตลอดระยะเวลาที่จำเป็นเพื่อให้บรรลุวัตถุประสงค์ที่เกี่ยวข้องกับนโยบายฉบับนี้
                      ซึ่งอาจจำเป็นต้องเก็บรักษาไว้ต่อไป
                      ภายหลังจากนั้นทางเว็บไซต์จะลบ ทำลาย
                      หรือทำให้เป็นข้อมูลที่ไม่สามารถระบุตัวตนของท่านได้
                      เมื่อหมดความจำเป็นหรือสิ้นสุดเป็นระยะเวลา 1
                      ปีนับแต่วันสิ้นสุดความสัมพันธ์หรือการติดต่อครั้งสุดท้ายจากผู้ใช้งาน
                      หรือภายใน 7 วันนับแต่วันแจ้งใช้สิทธิ์ลบข้อมูลจากผู้ใช้งาน
                    </p>
                    <p>
                      สิทธิของท่านในฐานะเจ้าของข้อมูลส่วนบุคคล
                      ภายใต้กฎหมายคุ้มครองข้อมูลส่วนบุคคล
                      ท่านมีสิทธิในการดำเนินการดังต่อไปนี้
                    </p>
                    <p>
                      สิทธิขอถอนความยินยอม (right to withdraw consent)
                      หากท่านได้ให้ความยินยอม ทางเว็บไซต์จะเก็บรวบรวม ใช้
                      หรือเปิดเผยข้อมูลส่วนบุคคลของท่าน
                      โดยท่านมีสิทธิที่จะถอนความยินยอมเมื่อใดก็ได้ตลอดเวลา
                    </p>
                    <p>
                      สิทธิขอเข้าถึงข้อมูล (right to access)
                      ท่านมีสิทธิขอเข้าถึงข้อมูลส่วนบุคคลของท่านที่อยู่ในความรับผิดชอบของทางเว็บไซต์
                      และขอให้ทางเว็บไซต์ทำสำเนาข้อมูลดังกล่าวให้แก่ท่าน
                      รวมถึงขอให้ทางเว็บไซต์เปิดเผยว่าทางเว็บไซต์ได้ข้อมูลส่วนบุคคลของท่านมาได้อย่างไร
                    </p>
                    <p>
                      สิทธิขอถ่ายโอนข้อมูล (right to data portability)
                      ท่านมีสิทธิขอรับข้อมูลส่วนบุคคลของท่านในกรณีที่ทางเว็บไซต์ได้จัดทำข้อมูลส่วนบุคคลนั้นอยู่ในรูปแบบให้สามารถอ่าน
                      หรือใช้งานได้ด้วยเครื่องมือ
                      หรืออุปกรณ์ที่ทำงานได้โดยอัตโนมัติและสามารถใช้หรือเปิดเผยข้อมูลส่วนบุคคลได้ด้วยวิธีการอัตโนมัติ
                      รวมทั้งมีสิทธิขอให้ทางเว็บไซต์ส่งหรือโอนข้อมูลส่วนบุคคลในรูปแบบดังกล่าวไปยังผู้ควบคุมข้อมูลส่วนบุคคลอื่นเมื่อสามารถทำได้ด้วยวิธีการอัตโนมัติ
                      และมีสิทธิขอรับข้อมูลส่วนบุคคลที่ทางเว็บไซต์ส่งหรือโอนข้อมูลส่วนบุคคลในรูปแบบดังกล่าวไปยังผู้ควบคุมข้อมูลส่วนบุคคลอื่นโดยตรง
                      เว้นแต่ไม่สามารถดำเนินการได้เพราะเหตุทางเทคนิค
                    </p>
                    <p>
                      สิทธิขอคัดค้าน (right to object)
                      ท่านมีสิทธิขอคัดค้านการเก็บรวบรวม ใช้
                      หรือเปิดเผยข้อมูลส่วนบุคคลของท่านในเวลาใดก็ได้
                      หากการเก็บรวบรวม ใช้
                      หรือเปิดเผยข้อมูลส่วนบุคคลของท่านที่ทำขึ้นเพื่อการดำเนินงานที่จำเป็นภายใต้ประโยชน์โดยชอบด้วยกฎหมายของทางเว็บไซต์
                      หรือของบุคคลหรือนิติบุคคลอื่น
                      โดยไม่เกินขอบเขตที่ท่านสามารถคาดหมายได้อย่างสมเหตุสมผล
                      หรือเพื่อดำเนินการตามภารกิจเพื่อสาธารณประโยชน์
                    </p>
                    <p>
                      สิทธิขอให้ลบหรือทำลายข้อมูล (right to erasure/destruction)
                      ท่านมีสิทธิขอลบหรือทำลายข้อมูลส่วนบุคคลของท่าน
                      หรือทำให้ข้อมูลส่วนบุคคลเป็นข้อมูลที่ไม่สามารถระบุตัวท่านได้
                      หากท่านเชื่อว่าข้อมูลส่วนบุคคลของท่านถูกเก็บรวบรวม ใช้
                      หรือเปิดเผยโดยไม่ชอบด้วยกฎหมายที่เกี่ยวข้องหรือเห็นว่าทางเว็บไซต์หมดความจำเป็นในการเก็บรักษาไว้ตามวัตถุประสงค์ที่เกี่ยวข้องในนโยบายฉบับนี้
                      หรือเมื่อท่านได้ใช้สิทธิขอถอนความยินยอมหรือใช้สิทธิขอคัดค้านตามที่แจ้งไว้ข้างต้นแล้ว
                    </p>
                    <p>
                      สิทธิขอให้ระงับการใช้ข้อมูล (right to restriction of
                      processing)
                      ท่านมีสิทธิขอให้ระงับการใช้ข้อมูลส่วนบุคคลชั่วคราวในกรณีที่ทางเว็บไซต์อยู่ระหว่างตรวจสอบตามคำร้องขอใช้สิทธิขอแก้ไขข้อมูลส่วนบุคคล
                      หรือขอคัดค้านของท่านหรือกรณีอื่นใดที่ทางเว็บไซต์หมดความจำเป็นและต้องลบหรือทำลายข้อมูลส่วนบุคคลของท่านตามกฎหมายที่เกี่ยวข้องแต่ท่านขอให้ทางเว็บไซต์ระงับการใช้แทน
                    </p>
                    <p>
                      สิทธิขอให้แก้ไขข้อมูล (right to rectification)
                      ท่านมีสิทธิขอแก้ไขข้อมูลส่วนบุคคลของท่านให้ถูกต้อง
                      เป็นปัจจุบัน สมบูรณ์ และไม่ก่อให้เกิดความเข้าใจผิด
                    </p>
                    <p>
                      สิทธิร้องเรียน (right to lodge a complaint)
                      ท่านมีสิทธิร้องเรียนต่อผู้มีอำนาจตามกฎหมายที่เกี่ยวข้อง
                      หากท่านเชื่อว่าการเก็บรวบรวม ใช้
                      หรือเปิดเผยข้อมูลส่วนบุคคลของท่าน
                      เป็นการกระทำในลักษณะที่ฝ่าฝืนหรือไม่ปฏิบัติตามกฎหมายที่เกี่ยวข้อง
                    </p>
                    <p>
                      ท่านสามารถใช้สิทธิของท่านในฐานะเจ้าของข้อมูลส่วนบุคคลข้างต้นได้
                      โดยติดต่อมาที่เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคลของทางเว็บไซต์ตามรายละเอียดท้ายนโยบายนี้
                      ทางเว็บไซต์จะแจ้งผลการดำเนินการภายในระยะเวลา 30 วัน
                      นับแต่วันที่ทางเว็บไซต์ได้รับคำขอใช้สิทธิจากท่าน
                      ตามแบบฟอร์มหรือวิธีการที่ทางเว็บไซต์กำหนด ทั้งนี้
                      หากทางเว็บไซต์ปฏิเสธคำขอทางเว็บไซต์จะแจ้งเหตุผลของการปฏิเสธให้ท่านทราบผ่านช่องทางต่าง
                      ๆ การติดต่อของท่าน เช่น ข้อความ (SMS) อีเมล โทรศัพท์
                      จดหมาย เป็นต้น
                    </p>
                    <p>5. ความปลอดภัยของข้อมูลส่วนบุคคลของท่าน</p>
                    <p>การรักษาความมั่งคงปลอดภัยของข้อมูลส่วนบุคคล</p>
                    <p>
                      ทางเว็บไซต์จะรักษาความมั่นคงปลอดภัยของข้อมูลส่วนบุคคลของท่านไว้ตามหลักการ
                      การรักษาความลับ (confidentiality) ความถูกต้องครบถ้วน
                      (integrity) และสภาพพร้อมใช้งาน (availability) ทั้งนี้
                      เพื่อป้องกันการสูญหาย เข้าถึง ใช้ เปลี่ยนแปลง แก้ไข
                      หรือเปิดเผย
                      นอกจากนี้ทางเว็บไซต์จะจัดให้มีมาตรการรักษาความมั่นคงปลอดภัยของข้อมูลส่วนบุคคล
                      ซึ่งครอบคลุมถึงมาตรการป้องกันด้านการบริหารจัดการ
                      (administrative safeguard) มาตรการป้องกันด้านเทคนิค
                      (technical safeguard) และมาตรการป้องกันทางกายภาพ (physical
                      safeguard)
                      ในเรื่องการเข้าถึงหรือควบคุมการใช้งานข้อมูลส่วนบุคคล
                      (access control)
                    </p>
                    <p>การแจ้งเหตุละเมิดข้อมูลส่วนบุคคล</p>
                    <p>
                      ในกรณีที่มีเหตุละเมิดข้อมูลส่วนบุคคลของท่านเกิดขึ้น
                      ทางเว็บไซต์จะแจ้งให้สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคลทราบโดยไม่ชักช้าภายใน
                      72 ชั่วโมง นับแต่ทราบเหตุเท่าที่สามารถกระทำได้
                      ในกรณีที่การละเมิดมีความเสี่ยงสูงที่จะมีผลกระทบต่อสิทธิและเสรีภาพของท่าน
                      ทางเว็บไซต์จะแจ้งการละเมิดให้ท่านทราบพร้อมกับแนวทางการเยียวยาโดยไม่ชักช้าผ่านช่องทางต่าง
                      ๆ การติดต่อของท่าน เช่น เว็บไซต์ ข้อความ (SMS) อีเมล
                      โทรศัพท์ จดหมาย เป็นต้น
                    </p>
                    <p>การแก้ไขประกาศความเป็นส่วนตัว</p>
                    <p>
                      ทางเว็บไซต์อาจมีปรับปรุงประกาศนี้ เพื่อให้เกิดความเหมาะสม
                      และให้สอดคล้องตามกฎหมายที่เกี่ยวข้องกับข้อมูลส่วนบุคคล
                      ทางเว็บไซต์จะแจ้งให้ท่านทราบผ่านทางเว็บไซต์ของทางเว็บไซต์
                    </p>
                    <p>
                      ทั้งนี้ หากภายหลังท่านยังคงใช้บริการกับทางเว็บไซต์
                      การปรับปรุงหรือแก้ไขประกาศฉบับนี้ในภายหน้า
                      ทางเว็บไซต์ขอถือว่าท่านเห็นชอบและยินยอมตามประกาศใหม่ต่อไป
                      เว้นแต่กฎหมายจะกำหนดแนวทางไว้เป็นอย่างอื่น
                    </p>
                    <p>ช่องทางการติดต่อทางเว็บไซต์</p>
                    <p>รายละเอียดการติดต่อ</p>
                    <p>
                      หากท่านต้องการสอบถามข้อมูลเกี่ยวกับนโยบายความเป็นส่วนตัวฉบับนี้
                      รวมถึงการขอใช้สิทธิต่าง ๆ ท่านสามารถติดต่อทางเว็บไซต์ได้
                      ดังนี้
                    </p>
                    <p>ทางเว็บไซต์ www.rushbooking.co</p>
                    <p>อีเมล application.rush1@gmail.com</p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

export default Restaurant;
