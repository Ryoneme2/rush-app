import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect } from 'react';
import RestaurantLayout from 'layouts/Restaurant';

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
import { Loading } from '@nextui-org/react';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

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

  console.log({ a, expireDate });

  const responseB = (
    await prisma.bOOKING.findMany({
      // where: {
      //   RESTAURANT_ID: parseInt(data.ID),
      //   BOOK_DATETIME: {
      //     gte: a,
      //     lt: expireDate,
      //   },
      //   IS_ACTIVE: true,
      // },
      select: {
        BOOKING_TABLES: { select: { TABLE: true } },
        BOOK_DATETIME: true,
      },

      orderBy: [{ ID: 'asc' }],
    })
  ).map((e) => {
    e.BOOKING_TABLES = e.BOOKING_TABLES.map((i) => {
      return { TABLE: i.TABLE };
    });
    return e;
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

  const router = useRouter();
  const { data: session } = useSession();
  const [a, setA] = useState(modifiedData);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [passData, setPassData] = useState({});

  const [bookingStep, setBookingStep] = useState(false);
  const [restaurantImage, setResImage] = useState(true);
  const [zoneSelected, setZoneSelected] = useState('Overall');

  //เขียนดักว่า เวลา xx ใช่ตัวบน ถ้า อีกเวลา xx ถึง xx จะใช้เอา -1 ออ
  //ต้องหาให้ได้ว่าเวลาไหน เดา 00.00 > 07.00
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
  const [tableLoading, setTableLoading] = useState(false);

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

  function HandleRestaurantImage() {
    if (restaurantImage) {
      return (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
        >
          {data.RESTAURANT_GALLERY.map((i, key) => {
            return (
              <SwiperSlide key={key}>
                <img
                  className='max-h-96 rounded-none md:rounded-lg mx-auto'
                  src={i.FILE_PATH}
                  alt=''
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
        // <Slider
        //     {...{
        //         dots: true,
        //         infinite: false,
        //         speed: 200,
        //         slidesToShow: 1,
        //         slidesToScroll: 1,
        //     }}
        // >
        //     {data.RESTAURANT_GALLERY.map((i, key) => {
        //         return <img className=" max-h-80 md:max-h-96 lg:max-h-96 rounded-lg mx-auto" src={i.FILE_PATH} alt="" />
        //     })}

        // </Slider>
      );
    } else {
      return (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className='h-fit'
        >
          {data.RESTAURANT_PLAN.map((i, key) => {
            return (
              <SwiperSlide key={key}>
                <img
                  className='max-h-860-px rounded-lg mx-auto'
                  src={i.FILE_PATH}
                  alt=''
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      );
    }
  }

  function HandleTableCount() {
    return <span>{pickTableList.length.toString()} Tables select</span>;
  }

  async function CheckAvaliableTable(date: any) {
    let startDate = new Date(date);
    let expireDate = new Date(date);

    setTableLoading(true);

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
    } finally {
      setTableLoading(false);
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
                if (tableData.IS_RESERVE) return;
                if (pickTableList.includes(tableData.ID)) {
                  setPerTable((prev) => prev - tableData.SEATS_AMOUNT);
                  setPickTableList(
                    pickTableList.filter((data) => {
                      return data !== tableData.ID;
                    })
                  );
                } else {
                  setPerTable((prev) => prev + tableData.SEATS_AMOUNT);
                  setPickTableList([...pickTableList, tableData.ID]);
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
          {a.AREA.filter((area) => area.NAME === zoneSelected).map(
            (filterZoneTableData, key) => {
              return (
                <div key={key}>
                  {filterZoneTableData.TABLE.map((filterTableData, key) => {
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (filterTableData.IS_RESERVE) return;
                          if (pickTableList.includes(filterTableData.ID)) {
                            setPerTable(
                              (prev) => prev - filterTableData.SEATS_AMOUNT
                            );
                            setPickTableList(
                              pickTableList.filter((data) => {
                                return data !== filterTableData.ID;
                              })
                            );
                          } else {
                            setPerTable(
                              (prev) => prev + filterTableData.SEATS_AMOUNT
                            );
                            setPickTableList([
                              ...pickTableList,
                              filterTableData.ID,
                            ]);
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

  // if (data.IS_CANCLE_POLICY) {
  //   if (
  //     dateCheck.getDate() == datepickerInput.getDate() &&
  //     dateCheck.getMonth() == datepickerInput.getMonth() &&
  //     dateCheck.getFullYear() == datepickerInput.getFullYear()
  //   ) {
  //     if (dateCheck.getHours() >= 19) {
  //       MySwal.fire({
  //         title:
  //           "<div class='text-xl'><p>การจองโต๊ะในวันนี้ปิดให้บริการแล้ว</p></div>",
  //         html: "<div class='text-left'><p>ขณะนี้ระบบในการจองโต๊ะของวันนี้ได้ถูกปิดลงแล้ว แต่ระบบการจองล่วงหน้าตั้งแต่วันพรุ่งนี้เป็นต้นไปยังสามารถทำได้ตามปกติ หากลูกค้ายังต้องการที่จะใช้บริการร้านนี้ในวันนี้อาจจะพอมีโอกาสจากการ Walk-in โดยตรงที่หน้าร้านครับ</p></div>",
  //         icon: 'warning',
  //         confirmButtonText: 'OK',
  //       });
  //       setDatepickerInput(
  //         new Date(new Date().setDate(new Date().getDate() + 1))
  //       );
  //       return;
  //     }
  //   }
  // }

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
        html: `<div class='px-4'><p class='text-left'>ลูกค้ากรุณาเข้าสู่ระบบเพื่อดำเนินการจองในขั้นตอนต่อไป</p></div>`,
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

  return (
    <div>
      <section className='w-full flex flex-wrap items-center justify-between'>
        <div className='container mx-auto flex flex-wrap items-center '>
          <div className='grid grid-cols-12 w-full'>
            <div className='col-span-full pb-8 pt-8 xs:order-1'>
              <HandleRestaurantImage />
            </div>
          </div>
          <div className='grid grid-cols-8 w-full pb-5 restaurant-layout'>
            <div className='col-span-full lg:col-span-5 xs:order-3 sm:order-2 restaurant-info mb-24'>
              <section className='mb-12'>
                <h1 className='font-bold text-2xl mb-6'>{data.NAME}</h1>
                <div className='flex flex-row items-center mb-2'>
                  <i className='fas fa-map-marker-alt text-secondary w-8 pl-0.5'></i>{' '}
                  <p>{data.ADDRESS}</p>
                </div>
                <div className='flex flex-row items-center mb-2'>
                  <i className='fas fa-clock text-secondary w-8'></i>{' '}
                  <p>{data.WORK_HOURS_DESCRIPTION}</p>
                </div>
                <div className='flex flex-row items-center'>
                  <i className='fab fa-itunes-note text-secondary w-8'></i>
                  <p>
                    {data.RESTAURANT_MUSIC_STYLE.map((music, index) => {
                      if (data.RESTAURANT_MUSIC_STYLE.length > index + 1) {
                        return music.MUSIC_STYLE.NAME + ', ';
                      } else return music.MUSIC_STYLE.NAME;
                    })}
                  </p>
                </div>
              </section>

              <section className='mb-12'>
                <h2 className='font-bold text-lg mb-6'>About</h2>
                <div
                  className='w-full whitespace-pre-wrap break-all'
                  dangerouslySetInnerHTML={{ __html: data.DESCRIPTION }}
                ></div>
              </section>

              <section className='mb-5'>
                <h2 className='font-bold text-lg mb-6'>Pricing</h2>
                <div>
                  {packages.map((data, key) => {
                    return (
                      <div key={key} className='flex flex-row space-x-4 mb-12'>
                        {/* <img src="https://www.w3schools.com/w3css/img_lights.jpg" alt="" className='w-40 h-40 rounded-md ' /> */}
                        <div className='flex flex-col min-h-fit w-5/6 sm:w-60 md:w-9/12 justify-between'>
                          <div>
                            <h2 className='font-bold mb-4'>{data.NAME}</h2>
                            <div className='whitespace-normal break-words mb-6'>
                              <div
                                className='w-full whitespace-pre-wrap break-words space-y-2'
                                dangerouslySetInnerHTML={{
                                  __html: data.DESCRIPTION,
                                }}
                              ></div>
                            </div>
                            <div className='font-bold package-price'>
                              {data.PRICE} THB
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className='mb-12'>
                <h2 className='font-bold text-lg mb-6'>Condition</h2>
                <div
                  className='w-full break-normal'
                  dangerouslySetInnerHTML={{ __html: data.CONDITION }}
                ></div>
              </section>

              <section className='mb-12'>
                <h2 className='font-bold text-lg mb-6'>Contact</h2>
                <div className=''>
                  {data.RESTAURANT_CONTACT.map((contact, key) => {
                    return (
                      <div key={key} className='flex flex-row mb-2 w-full '>
                        <div className='mr-2 whitespace-nowrap'>
                          {contact.TITLE} :{' '}
                        </div>
                        <div
                          className='w-full break-normal'
                          key={key}
                          dangerouslySetInnerHTML={{ __html: contact.DETAIL }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </section>
              {data.IS_CANCLE_POLICY && (
                <section className='space-y-5'>
                  <h2 className='font-bold text-lg mb-5 '>
                    Cancellation policy
                  </h2>
                  <p>
                    1. ลูกค้าสามารถแจ้งขอคืนเงิน (ยกเลิกการจอง)
                    ได้ในกรณีที่เหลือระยะเวลามากกว่า{' '}
                    <span className='font-bold'>12 ชั่วโมง</span>{' '}
                    ขึ้นไปก่อนที่จะถึงวันที่ต้องมาใช้บริการเท่านั้น
                    โดยใช้เกณฑ์จากเวลาการปล่อยโต๊ะเพื่อให้ลูกค้า Walk-in
                    ตามที่กำหนดไว้ในเงื่อนไขของแต่ละร้าน (ดูเพิ่มเติมได้ในหัวข้อ
                    Condition) ที่แสดงผลอยู่ด้านบน ยกตัวอย่างเช่น ร้าน A
                    กำหนดเงื่อนไขเวลาในการปล่อยโต๊ะไว้ที่ 2 ทุ่ม นั่นแสดงว่า
                    ลูกค้าต้องมาทำเรื่องแจ้งขอคืนเงิน (ยกเลิกการจอง) ก่อนเวลา 8
                    โมงเช้าในวันที่ต้องมาใช้บริการเท่านั้นและจะ
                    ใช้เกณฑ์ในการกำหนดเวลากลางจากเวลาที่ระบุอยู่ในข้อความที่ลูกค้าเริ่มทักแชทเข้ามาแจ้งขอคืนเงิน
                    (ยกเลิกการจอง) ผ่านช่องทางของ Line OA
                    เป็นมาตรฐานในการนับเวลา
                  </p>
                  <p>
                    ** ในกรณีที่การจองของลูกค้าไม่มีการเก็บค่าใช้บริการ
                    หากลูกค้าต้องการที่จะยกเลิกการจองก็ให้ใช้เงื่อนไขเดียวกันกับในข้อ
                    1
                  </p>
                  <p>
                    2. หากลูกค้าปฏิบัติตามเงื่อนไขในการแจ้งขอคืนเงิน
                    (ยกเลิกการจอง) ที่กำหนดอยู่ในข้อที่ 1 ได้ถูกต้อง
                    ลูกค้าจะได้รับเงินคืนทั้งในส่วนของเงินที่ใช้ซื้อแพ็คเกจหรือโปรโมชั่นและเงินค่าบริการที่จ่ายให้กับทางเรา
                    (Service fee) เต็มจำนวน 100%
                    แต่จะมีระยะเวลาในการดำเนินงานในการทำเรื่องแจ้งขอคืนเงิน
                    (ยกเลิกการจอง) โดยประมาณไม่เกิน 1 สัปดาห์
                  </p>
                  <p>
                    3. หากลูกค้าไม่สามารถปฏิบัติตามเงื่อนไขในการแจ้งขอคืนเงิน
                    (ยกเลิกการจอง) ที่กำหนดอยู่ในข้อที่ 1 ได้ถูกต้อง ในทุกกรณี
                    ทางเราขออนุญาติไม่คืนเงินทั้งในส่วนของเงินที่ใช้ซื้อแพ็คเกจหรือโปรโมชั่นและเงินค่าบริการที่จ่ายให้กับทางเรา
                    (Service fee) เต็มจำนวน 100%
                  </p>
                </section>
              )}
            </div>

            <div className='hidden lg:block lg:col-span-3 xs:order-2 sm:order-3 mb-9'>
              <div className='flex sm:flex-col xl:flex-row justify-between gap-2 sm:gap-0'>
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
                      <div className='z-2 bg-light shadow-md rounded-lg '>
                        <DatePicker
                          disabled={true}
                          onChange={(date) => {
                            let checkDate = new Date(date);

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
                              }
                              // else {
                              //   setDatepickerInput(new Date());
                              //   MySwal.fire({
                              //     title: 'เกิดข้อผิดพลาด',
                              //     text: 'วันที่เลือกสามารถไม่สามารถทำการจองได้',
                              //     icon: 'warning',
                              //     confirmButtonText: 'ok',
                              //   });
                              // }
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
                              }
                              //  else {
                              //   setDatepickerInput(new Date());
                              //   MySwal.fire({
                              //     title: 'เกิดข้อผิดพลาด',
                              //     text: 'วันที่เลือกสามารถไม่สามารถทำการจองได้',
                              //     icon: 'warning',
                              //     confirmButtonText: 'ok',
                              //   });
                              // }
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
              <div className='w-full my-8'>
                <button
                  className='text-center w-full  font-bold bg-primary text-white rounded-lg py-2'
                  onClick={() => {
                    setResImage(!restaurantImage);
                  }}
                >
                  {restaurantImage
                    ? 'Check restaurant layout'
                    : 'Show restaurant image'}
                </button>
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
                          console.log(zoneData);

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
                      {tableLoading ? (
                        <div className='flex flex-row justify-center'>
                          <Loading color='secondary'></Loading>
                        </div>
                      ) : (
                        <HandleTableFilter />
                      )}
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
                          <div key={key} className='flex flex-col mb-4 py-3'>
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

            <div className='fixed lg:hidden flex flex-row justify-end pr-6 px-6 w-full h-20 bg-white border bottom-0 left-0 z-3'>
              {/* <p className="text-sm font-bold">{datepickerInput.getDate().toString()}/{(datepickerInput.getMonth() + 1).toString()}/{datepickerInput.getFullYear().toString()}</p> */}

              <button
                className='bg-primary text-white w-32 h-11 rounded-md text-sm font-bold self-center'
                onClick={() => {
                  router.push(rid + '/' + 'booking');
                }}
              >
                Booking
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Restaurant.layout = RestaurantLayout;

export default Restaurant;
