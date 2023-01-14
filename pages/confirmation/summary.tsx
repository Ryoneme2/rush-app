/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import Link from 'next/link';

import { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Divider } from '@nextui-org/react';
import Swal from 'sweetalert2';
import { Session } from 'next-auth';

export default function Summary() {
  const { data: session } = useSession() as {
    data: Session & {
      tokenUser: string;
      fname: string;
      lname: string;
    };
  };

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [term, setTermModalOpen] = useState(false);
  const [PDPA, setPDPAModalOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  const [onlyTableData, setOnlyTableData] = useState([]);

  const router = useRouter();

  let passData = router.query;
  async function API_POST_BOOKING() {
    let modifyJSONData = JSON.parse(passData.data.toString());

    // modifyJSONData.bookingDatetime = new Date(new Date(modifyJSONData.bookingDatetime)).toISOString()
    // console.log(modifyJSONData);

    const startDate = new Date(
      JSON.parse(passData.data.toString()).bookingDatetime
    );
    const expireDate = new Date(
      JSON.parse(passData.data.toString()).bookingDatetime
    );
    let isAvaliable = false;

    await Promise.all(
      JSON.parse(passData.data.toString()).BOOKING_TABLES.map(async (e) => {
        const res = fetch(`/api/action/booking/findCheckBkTbAvailable`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            restaurantId: JSON.parse(passData.data.toString()).restaurantId,
            bookStartDatetime: new Date(startDate.setHours(0, 0, 0, 0)),
            bookEndDatetime: new Date(
              expireDate.setDate(expireDate.getDate() + 1)
            ),
            tableId: e,
          }),
        }).then((response) => {
          // console.log(response.body);
          if (response.status == 400) {
            isAvaliable = true;
          }
        });
        return res;
      })
    );

    // console.log(isAvaliable);

    if (!isAvaliable) {
      const push = await fetch(`/api/action/booking/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.tokenUser,
        },
        body: JSON.stringify(modifyJSONData),
      });
      console.log({ modifyJSONData });

      // router.push({
      //     pathname: '/confirmation/success',
      // })
    } else {
      Swal.fire({
        title: 'โต๊ะที่ลูกค้าเลือกถูกจองไปแล้ว',
        html: "<div class='text-left space-y-5'><p>1. กรุณาติดต่อ Line OA @886jxuaj หรือคลิกลิงก์ <a href='https://lin.ee/hWLrvSM' target='_blank'>https://lin.ee/hWLrvSM</a> เพื่อให้ทางทีมงานโอนเงินคืนแก่ลูกค้า</p> <p>2. หากลูกค้าต้องการที่จะเลือกโต๊ะใหม่ ลูกค้าสามารถดำเนินการตามขั้นตอนการจองแบบเดิมได้ครับ</p></div>",
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    }
  }

  function ShowPackage() {
    return JSON.parse(passData.packageData.toString()).map((i, key) => {
      if (
        JSON.parse(passData.data.toString()).BOOKING_PACKAGE_SELECT.filter(
          (e) => e.includes(i.ID)
        ).length != 0
      ) {
        return (
          <div className='flex flex-row justify-between' key={key}>
            <p>
              {i.NAME}
              <span>
                {' '}
                x{' '}
                {
                  JSON.parse(
                    passData.data.toString()
                  ).BOOKING_PACKAGE_SELECT.filter((e) => e.includes(i.ID))
                    .length
                }
              </span>
            </p>
            <p>
              {JSON.parse(
                passData.data.toString()
              ).BOOKING_PACKAGE_SELECT.filter((e) => e.includes(i.ID)).length *
                i.PRICE}{' '}
              THB
            </p>
          </div>
        );
      } else {
        return <div key={key}></div>;
      }
    });
  }

  if (passData.tableData) {
    const month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return (
      <div className='mx-auto flex flex-col summary-layout'>
        <div className='w-full hidden lg:flex flex-row mt-8 mb-0'>
          <Link href='/'>
            <button className='text-primary text-4xl font-bold '>RUSH</button>
          </Link>
        </div>

        <h1 className='summary-title-menu font-bold mb-12 flex flex-row justify-between mt-12'>
          <div>
            <i
              className='fas fa-chevron-left cursor-pointer'
              onClick={() => {
                history.back();
              }}
            ></i>
          </div>{' '}
          <h2>Confirm and payment</h2> <div></div>
        </h1>

        <div className='grid grid-flow-row sm:reverse grid-cols-12 mb-20 lg:px-0 space-x-0 lg:space-x-12'>
          <div className='col-span-12 lg:col-span-6 order-last lg:order-first pb-2 pr-0'>
            <div className='flex flex-col'>
              <div className='mb-12 xl:mb-12 flex flex-col'>
                <div className='summary-title'>
                  <p className='font-bold text-xl'>Booking summary</p>
                </div>

                <div className='flex flex-row space-x-5 mb-6 mt-8'>
                  <div>
                    <p className='font-bold mb-2'>Name</p>
                    <p>{!session?.fname ? '' : session.fname.toString()}</p>
                  </div>

                  <div>
                    <p className='font-bold mb-2'>Surname</p>
                    <p>{!session?.lname ? '' : session.lname.toString()}</p>
                  </div>
                </div>

                <div className='mb-6'>
                  <p className='font-bold mb-2'>Dates</p>
                  <p>
                    {new Date(
                      JSON.parse(passData.data.toString()).bookingDatetime
                    )
                      .toLocaleString('en')
                      .split(' ')[0]
                      .split('/')[1] + ' '}
                    {month[
                      Number(
                        new Date(
                          JSON.parse(passData.data.toString()).bookingDatetime
                        )
                          .toLocaleString('en')
                          .split(' ')[0]
                          .split('/')[0]
                      ) - 1
                    ] + ' '}
                    {new Date(
                      JSON.parse(passData.data.toString()).bookingDatetime
                    )
                      .toLocaleString('en')
                      .split(' ')[0]
                      .split('/')[2]
                      .split(',')}
                  </p>
                </div>

                <div className='mb-6 xl:mb-0'>
                  <p className='font-bold mb-2'>Guests</p>
                  <p>
                    {JSON.parse(passData.data.toString()).guests_amount}
                    &nbsp; Person
                    {/* {JSON.parse(passData.data.toString()).guests_amount > 1 ? "People" : "Person"} */}
                  </p>
                </div>

                <div className='lg:hidden'>
                  <p className='font-bold mb-2'>Zone & tables</p>

                  <div className='flex flex-row justify-between'>
                    <p className=''>{passData.tableCount} tables selected</p>
                    <button
                      className='underline font-bold'
                      onClick={() => {
                        setDetailModalOpen(true);
                      }}
                    >
                      See details
                    </button>
                  </div>
                </div>

                <div className='lg:hidden pt-12'>
                  <div className='mb-8'>
                    <p className='font-bold text-xl'>Price detail</p>
                  </div>
                  <div className='space-y-6'>
                    <ShowPackage />

                    <div className='flex flex-row justify-between'>
                      <p>Service fee</p>
                      <p>{passData.fee} THB</p>
                    </div>
                  </div>
                  <div className='flex flex-row justify-between font-bold pb-5 pt-8'>
                    <p className='text-xl'>Total</p>
                    <p>{JSON.parse(passData.data.toString()).totalPrice} THB</p>
                  </div>
                </div>
              </div>

              <div className='mb-12'>
                <p className='font-bold text-xl mb-8'>Payment method</p>
                <div className='border-1 shadow-lg flex flex-col p-3 rounded-md mb-8'>
                  <div className='flex flex-row space-x-6 w-full mb-6 p-6 payment-text'>
                    <img
                      src='https://www.kasikornbank.com/SiteCollectionDocuments/about/img/logo/logo.png'
                      alt=''
                      className='w-10 h-10'
                    />

                    <div className=''>
                      <p className='mb-2'>Kasikornbank</p>
                      <p>Account name</p>
                    </div>

                    <div className='font-bold'>
                      <p className='mb-2'>135-8-41887-9</p>
                      <p className='payment-name'>นาย สิรภพ วงศ์นาถกุล</p>
                      <p className='payment-name'>และ นาย ตฤณ เชื้อชม</p>
                    </div>
                  </div>
                  <img
                    src='../img/QRCODE_PAYMENT.JPG'
                    alt=''
                    className='w-44 h-52 mx-auto mb-6'
                  />
                </div>

                <div className='text-primary flex flex-col space-y-5 font-bold'>
                  <p className='font-bold'>
                    **
                    ลูกค้ากรุณาโอนเงินตามยอดรวมทั้งหมดเข้ามาที่เลขบัญชีที่แสดงผลอยู่ด้านบน
                    ก่อนที่จะกดปุ่ม Confirm payment ทุกครั้งครับ
                  </p>

                  <p className='font-bold'>
                    ** หากยอดที่แสดงเป็น 0 บาท ลูกค้าสามารถกดปุ่ม Confirm
                    payment แล้วทำตามข้อมูลที่แจ้งในขั้นตอนต่อไปได้เลยครับ
                  </p>

                  {/* <p>Line @886jxuaj</p>
                                    <p>or click <a className="hover:underline" href="https://lin.ee/hWLrvSM" target="_blank">https://lin.ee/hWLrvSM</a></p>
                                    <p>in order to confirm your payment before pressing the confirm payment button</p> */}
                </div>
              </div>

              <div className='mb-12'>
                <p className='font-bold text-xl mb-5'>Condition</p>

                <div className='text-primary flex flex-col font-bold'>
                  <div
                    className='w-full whitespace-normal break-words '
                    dangerouslySetInnerHTML={{
                      __html: String(passData.condition),
                    }}
                  ></div>
                </div>
              </div>

              {passData.IS_CANCLE_POLICY === 'true' ? (
                <div className='mb-12'>
                  <p className='font-bold text-xl mb-5'>Cancellation policy</p>
                  <div className='flex flex-col font-bold space-y-6 whitespace-normal'>
                    <p>
                      1. ลูกค้าสามารถแจ้งขอคืนเงิน (ยกเลิกการจอง)
                      ได้ในกรณีที่เหลือระยะเวลามากกว่า{' '}
                      <span className='font-bold'>12 ชั่วโมง</span>{' '}
                      ขึ้นไปก่อนที่จะถึงวันที่ต้องมาใช้บริการเท่านั้น
                      โดยใช้เกณฑ์จากเวลาการปล่อยโต๊ะเพื่อให้ลูกค้า Walk-in
                      ตามที่กำหนดไว้ในเงื่อนไขของแต่ละร้าน
                      (ดูเพิ่มเติมได้ในหัวข้อ Condition) ที่แสดงผลอยู่ด้านบน
                      ยกตัวอย่างเช่น ร้าน A
                      กำหนดเงื่อนไขเวลาในการปล่อยโต๊ะไว้ที่ 2 ทุ่ม นั่นแสดงว่า
                      ลูกค้าต้องมาทำเรื่องแจ้งขอคืนเงิน (ยกเลิกการจอง) ก่อนเวลา
                      8 โมงเช้าในวันที่ต้องมาใช้บริการเท่านั้นและจะ
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
                      (ยกเลิกการจอง) ที่กำหนดอยู่ในข้อที่ 1 ได้ถูกต้องในทุกกรณี
                      ทางเราขออนุญาติไม่คืนเงินทั้งในส่วนของเงินที่ใช้ซื้อแพ็คเกจหรือโปรโมชั่นและเงินค่าบริการที่จ่ายให้กับทางเรา
                      (Service fee) เต็มจำนวน 100%
                    </p>
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              <div>
                <p className='font-bold mb-8'>
                  By selection confirm payment, I agree to Rush
                  <span
                    className='text-term underline cursor-pointer '
                    onClick={() => {
                      setTermModalOpen(true);
                    }}
                  >
                    {' '}
                    Term of Service{' '}
                  </span>
                  and acknowledge the
                  <span
                    className='text-term underline cursor-pointer'
                    onClick={() => {
                      setPDPAModalOpen(true);
                    }}
                  >
                    {' '}
                    PDPA Privacy Policy.
                  </span>
                </p>

                <button
                  className='bg-primary text-center text-white font-bold py-3 w-full rounded-md'
                  onClick={() => {
                    API_POST_BOOKING();
                  }}
                >
                  Confirm payment
                </button>
              </div>
            </div>
          </div>

          <div className='col-span-12 lg:col-span-6 mb-5'>
            <div className='mb-8 summary-title-mobile'>
              <p className='font-bold text-xl'>Booking summary</p>
            </div>

            <div className='lg:border lg:border-black lg:shadow-md lg:rounded-md xs:px-0 xs:py-0 lg:px-8 lg:py-12 sm:w-full lg:w-12/12 '>
              <div className='flex flex-row  sm:h-fit lg:h-36'>
                <div className='hidden lg:block summary-restaurant-img-pc mr-6'>
                  <img
                    src={String(passData.images)}
                    alt='Restaurant Image'
                    className='w-full h-full rounded-md'
                  />
                </div>
                <img
                  src={String(passData.images)}
                  alt='Restaurant Image'
                  className='block lg:hidden w-36 h-20  rounded-md mr-4'
                />
                <div className='flex flex-col justify-between w-full'>
                  <div>
                    <p className='font-bold mb-2'>{passData.Name}</p>
                    <div>
                      <i className='fas fa-map-marker-alt mr-2'></i>
                      <span>{passData.Location}</span>
                    </div>
                  </div>
                  <div className='hidden lg:block'>
                    <p className='font-bold mb-2'>Zone & tables</p>

                    <div className='flex flex-row justify-between'>
                      <p className=''>{passData.tableCount} tables selected</p>
                      <button
                        className='underline font-bold'
                        onClick={() => {
                          setDetailModalOpen(true);
                        }}
                      >
                        See details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='hidden lg:block'>
                <div className='py-8'>
                  <p className='font-bold text-xl'>Price detail</p>
                </div>
                <div className='space-y-6'>
                  <ShowPackage />

                  <div className='flex flex-row justify-between'>
                    <p>Service fee</p>
                    <p>{passData.fee} THB</p>
                  </div>
                </div>
                <div className='flex flex-row justify-between font-bold pt-8'>
                  <p className='text-xl'>Total</p>
                  <p>{JSON.parse(passData.data.toString()).totalPrice} THB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Transition.Root show={detailModalOpen} as={Fragment}>
          <Dialog
            as='div'
            className='relative z-10'
            initialFocus={cancelButtonRef}
            onClose={setDetailModalOpen}
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
              <div className='flex items-center justify-center min-h-full p-4 text-center sm:p-0'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-out duration-300'
                  enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                  enterTo='opacity-100 translate-y-0 sm:scale-100'
                  leave='ease-in duration-200'
                  leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                  leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                >
                  <Dialog.Panel className='relative bg-white rounded-md text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full sm:w-full p-5 space-y-6'>
                    <div className='flex flex-row justify-between'>
                      <h1 className='text-xl font-bold'>Zone & tables</h1>
                      <i
                        className='fas fa-times cursor-pointer self-center'
                        onClick={() => {
                          setDetailModalOpen(false);
                        }}
                      ></i>
                    </div>

                    {JSON.parse(passData.tableData.toString()).map((i, key) => {
                      return (
                        <div key={key}>
                          {i.TABLE.length > 0 ? (
                            <p className='font-bold mb-3' key={key}>
                              {i.NAME}
                            </p>
                          ) : (
                            <></>
                          )}

                          {i.TABLE.map((e, k) => {
                            return (
                              <p className='mb-2' key={k}>
                                Table {e.NAME} (for {e.SEATS_AMOUNT} people)
                              </p>
                            );
                          })}
                        </div>
                      );
                    })}

                    <div className='flex flex-row justify-between'>
                      <p className='font-bold'>Total</p>
                      <p className='font-bold'>
                        {passData.tableCount} Tables select
                      </p>
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
                        สิทธิ์การเข้าร่วมกิจกรรม
                        สั่งอาหารหรือเครื่องดื่มล่วงหน้า การชำระเงิน
                        การรับรายการบริการอื่น ๆ ให้แก่ลูกค้า และร้านค้า
                        ซึ่งแพลตฟอร์มดังกล่าวมีทั้งที่เป็นเว็บไซต์
                        และ/หรือช่องทางอื่นใดตามที่เว็บไซต์กำหนดเพิ่มเติมในภายหน้า
                      </p>
                      <p>
                        1.5 “รายการการใช้บริการ” หมายความถึง คำสั่ง หรือรายการ
                        หรือธุรกรรมต่าง ๆ เกี่ยวกับการใช้บริการผ่านแพลตฟอร์ม
                        เช่น การสำรองที่นั่ง การสำรองสิทธิ์เข้าร่วมกิจกรรม
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
                        เพื่อขอใช้แพลตฟอร์มก่อน โดยลูกค้าจะต้องมีอายุไม่ต่ำกว่า
                        20 ปี หรือบรรลุนิติภาวะ กรณีอายุต่ำกว่าที่กำหนด
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
                        และ/หรือ รายละเอียดใด ๆ
                        ที่เกี่ยวข้องกับรายการการใช้บริการ
                        ว่าถูกต้องครบถ้วนหรือไม่{' '}
                      </p>
                      <p>
                        2.4 ข้อมูลร้านค้าของร้านค้า
                        ซึ่งรวมถึงแต่ไม่จํากัดเฉพาะข้อมูลอาหารเครื่องดื่ม
                        ราคาอาหารเครื่องดื่ม การทํารายการส่งเสริมการขายต่าง ๆ
                        และข้อมูลอื่นใดที่ปรากฏบนแพลตฟอร์ม เป็นข้อมูลที่ถูกต้อง
                        ครบถ้วน และเป็นจริงทุกประการ รวมทั้งไม่โฆษณาเกินจริง
                        นอกจากนี้ <br />
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
                        ค่าธรรมเนียม และภาษี (ถ้ามี)
                        รวมถึงค่ารายการส่งเสริมการขาย ให้แล้วเสร็จก่อน
                        แล้วจึงโอนเงินส่วนที่เหลือเข้าบัญชีรับเงินของร้านค้า
                        ตามที่ร้านค้าแจ้งแก่แพลตฟอร์ม
                        โดยแพลตฟอร์มจะโอนเงินดังกล่าวให้แก่ร้านค้า ภายในระยะเวลา
                        1 วันทําการนับจากวันที่ลูกค้าทํารายการชําระเงิน
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
                        เว็บไซต์ยังคงเป็นเจ้าของลิขสิทธิ์ ทรัพย์สินทางปัญญา
                        สิทธิ และ/หรือ ผลประโยชน์ทั้งหลายทั้งปวงในแพลตฟอร์ม
                      </p>
                      <p>
                        อนึ่ง การที่ลูกค้า
                        และร้านค้าได้รับสิทธิในการใช้แพลตฟอร์ม
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
                        4.2.3 ใช้หุ่นยนต์ สไปเดอร์ (Spiders) คลอว์เลอส์
                        (Crawlers) สเครปปิ้ง (Scraping)
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
                        5.2
                        เว็บไซต์มีสิทธิระงับหรือยกเลิกการให้บริการเมื่อใดก็ได้
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
                        หรือ โปรแกรมรบกวนอื่น ๆ เข้าสู่แพลตฟอร์ม หรือกระทำการใด
                        ๆ
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
                        ประมวลผลข้อมูลเกี่ยวกับลูกค้าและร้านค้า
                        รายการการใช้บริการ หรือ การดำเนินการใด ๆ
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
                        ไปยังที่อยู่อิเล็กทรอนิกส์ต่าง ๆ
                        และหมายเลขโทรศัพท์มือถือ เป็นต้น
                        โดยลูกค้าและร้านค้าสามารถบอกเลิกหรือปฏิเสธการรับข้อมูลดังกล่าวได้ตามช่องทางที่เว็บไซต์กำหนด
                      </p>
                      <p>
                        8. การปฏิบัติตามระเบียบ คู่มือ
                        ข้อกำหนดและเอกสารเกี่ยวกับการใช้บริการของเว็บไซต์
                      </p>
                      <p>
                        8.1 ลูกค้า
                        และร้านค้าตกลงยอมรับผูกพันและปฏิบัติตามระเบียบ
                        ข้อกำหนดและเงื่อนไข รวมถึงคู่มือ
                        และเอกสารอธิบายวิธีการใช้บริการตามที่เว็บไซต์กำหนด
                        ซึ่งลูกค้าและร้านค้าได้รับทราบแล้ว
                        รวมทั้งตามที่เว็บไซต์จะได้กำหนดเพิ่มเติม แก้ไข
                        หรือเปลี่ยนแปลงในภายหน้าและแจ้งให้ลูกค้าและร้านค้าทราบ
                        โดยลงประกาศเป็นการทั่วไปบนแพลตฟอร์ม หรือเว็บไซต์
                        หรือเว็บไซต์อื่นที่เว็บไซต์จะได้กำหนดหรือเปลี่ยนแปลงในภายหน้า
                        (ถ้ามี)
                        หรือโดยวิธีการอื่นใดที่เว็บไซต์จะได้กำหนดเพิ่มเติม
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
                        ที่เว็บไซต์ได้ส่งไปยังลูกค้าและร้านค้า
                        ทางหมายเลขโทรศัพท์ อีเมล
                        ตามที่ลูกค้าและร้านค้าได้ให้ไว้กับเว็บไซต์
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
                      <p className='pl-3'>
                        - วัตถุประสงค์การใช้ข้อมูลส่วนบุคคล
                      </p>
                      <p className='pl-3'>- การเปิดเผยข้อมูลส่วนบุคคล</p>
                      <p className='pl-3'>
                        - สิทธิของท่านที่มีต่อข้อมูลส่วนบุคคล
                        และการคุ้มครองตามกฎหมาย
                      </p>
                      <p>
                        เว็บไซต์จะเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน
                        โดยการลงทะเบียนสมาชิกผ่านช่องทางเว็บไซต์ อีเมล์,
                        Facebook Login ,Google Login, LINE Login, อื่น ๆ เป็นต้น
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
                        ข้อมูลการติดต่อ เช่น ที่อยู่ หมายเลขโทรศัพท์ อีเมล
                        เป็นต้น
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
                      <p className='pl-3'>
                        - เพื่อสร้างและจัดการบัญชีผู้ใช้งาน
                      </p>
                      <p className='pl-3'>
                        - เพื่อบริการสำรองที่นั่ง สำรองสิทธิ์เข้าร่วมกิจกรรม
                        การสั่งซื้ออาหารและเครื่องดื่ม
                      </p>
                      <p className='pl-3'>
                        - เพื่อปรับปรุงบริการ หรือประสบการณ์การใช้งาน
                      </p>
                      <p className='pl-3'>- เพื่อการบริหารจัดการภายใน</p>
                      <p className='pl-3'>
                        - เพื่อการตลาด และการส่งเสริมการขาย
                      </p>
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
                        หรือภายใน 7
                        วันนับแต่วันแจ้งใช้สิทธิ์ลบข้อมูลจากผู้ใช้งาน
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
                        สิทธิขอให้ลบหรือทำลายข้อมูล (right to
                        erasure/destruction)
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
                        (technical safeguard) และมาตรการป้องกันทางกายภาพ
                        (physical safeguard)
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
                        ทางเว็บไซต์อาจมีปรับปรุงประกาศนี้
                        เพื่อให้เกิดความเหมาะสม
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
  } else {
    return <></>;
  }
}
