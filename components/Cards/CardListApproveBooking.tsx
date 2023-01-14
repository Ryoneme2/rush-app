import { GetStaticProps } from "next";
import React from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";
import Link from "next/link";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

// components

export default function CardListApproveBooking({
  list,
  setList,
  restaurantId,
  refresh
}) {

  const MySwal = withReactContent(Swal);

  const router = useRouter();
  const onClickConfirm = async (e, data) => {
    const endpoint = `/api/booking/upsert`;

    let JSONdata = JSON.stringify({
      id: data.ID,
      restaurantId: data.RESTAURANT_ID,
      customerId: data.CUSTOMER_ID,
      guestsAmount: data.GUESTS_AMOUNT,
      bookDatetime: data.BOOK_DATETIME,
      totalPrice: data.TOTAL_PRICE,
      status: 'Confirm',
      isApprove: true,
      isActive: true,
    });

    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },
      body: JSONdata,
    };

    let response
    try {
      response = await fetch(endpoint, options);
      refresh({ status: 'All' })
      router.replace(router.asPath);
    } catch (error) {
      const MySwal = withReactContent(Swal)
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }

  };
  const onClickReject = async (e, data) => {
    const endpoint = `/api/booking/upsert`;

    let JSONdata = JSON.stringify({
      id: data.ID,
      restaurantId: data.RESTAURANT_ID,
      customerId: data.CUSTOMER_ID,
      guestsAmount: data.GUESTS_AMOUNT,
      bookDatetime: data.BOOK_DATETIME,
      totalPrice: data.TOTAL_PRICE,
      status: 'Reject',
      isApprove: false,
      isActive: false,
    });

    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },
      body: JSONdata,
    };

    let response
    try {
      response = await fetch(endpoint, options);
      refresh({ status: 'All' })
      router.replace(router.asPath);
    } catch (error) {
      const MySwal = withReactContent(Swal)
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }

  };
  const onClickRefund = async (e, data) => {
    const endpoint = `/api/booking/upsert`;

    let JSONdata = JSON.stringify({
      id: data.ID,
      restaurantId: data.RESTAURANT_ID,
      customerId: data.CUSTOMER_ID,
      guestsAmount: data.GUESTS_AMOUNT,
      bookDatetime: data.BOOK_DATETIME,
      totalPrice: data.TOTAL_PRICE,
      status: 'Refund',
      isApprove: false,
      isActive: false,
    });

    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },
      body: JSONdata,
    };

    let response
    try {
      response = await fetch(endpoint, options);
      refresh({ status: 'All' })
      router.replace(router.asPath);
    } catch (error) {
      const MySwal = withReactContent(Swal)
      MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
    }

  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-blueGray-700">
                ตารางยืนยันการจอง
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right"></div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  ชื่อผู้จอง
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  เบอร์ติดต่อ
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  แพ็คเกจ
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  จำนวนแขก
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  โต๊ะ
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  สถานะการจอง
                </th>
                <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  เมนูจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((value, index) => {
                return (
                  <tr key={index} className="border-b">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                      {value?.ACCOUNT?.FIRST_NAME} {value?.ACCOUNT?.LAST_NAME}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {value?.ACCOUNT?.PHONE}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {value?.PACKAGE.map((data) => data?.NAME + " , ")}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {value?.BOOKING?.GUESTS_AMOUNT}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {value?.TABLE.map((data) => data?.NAME + " , ")}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 font-bold">
                      {value?.STATUS}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">


                      {/* <Link href={`approve_booking/${value.ID}`}>
                        <a> */}
                      {value?.STATUS == "Pending" ? <div>
                        <button
                          className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          data-modal-toggle="defaultModal"
                          value={value.ID}
                          onClick={(e) => {
                            MySwal.fire({
                              title: "Approve booking",
                              text: "Are you sure to approve this booking?",
                              icon: "question",
                              showCancelButton: true,
                              cancelButtonText: "No",
                              confirmButtonText: "Yes",
                              showLoaderOnConfirm: true,
                              preConfirm(inputValue) {
                                //DO FUNCTION HERE
                                onClickConfirm(e, value.BOOKING)
                              },
                            })
                          }}
                        >
                          Confirm
                        </button> <button
                          className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          data-modal-toggle="defaultModal"
                          value={value.ID}
                          onClick={(e) => {
                            MySwal.fire({
                              title: "Deny booking",
                              text: "Are you sure to deny this booking?",
                              icon: "question",
                              showCancelButton: true,
                              cancelButtonText: "No",
                              confirmButtonText: "Yes",
                              showLoaderOnConfirm: true,
                              preConfirm(inputValue) {
                                //DO FUNCTION HERE
                                onClickReject(e, value.BOOKING)
                              },
                            })
                          }}
                        >
                          Reject
                        </button>

                      </div> :
                        <></>
                      }

                      {value.STATUS == "Confirm" ? <div>
                        <button
                          className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          data-modal-toggle="defaultModal"
                          value={value.ID}
                          onClick={(e) => {
                            MySwal.fire({
                              title: "Refund booking",
                              text: "Are you sure to refund this booking?",
                              icon: "question",
                              showCancelButton: true,
                              cancelButtonText: "No",
                              confirmButtonText: "Yes",
                              showLoaderOnConfirm: true,
                              preConfirm(inputValue) {
                                //DO FUNCTION HERE
                                onClickRefund(e, value.BOOKING)
                              },
                            })
                          }}
                        >
                          Refund
                        </button>
                      </div> :
                        <></>
                      }


                      {/* </a>
                      </Link> */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
