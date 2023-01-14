import React, { useRef, useState, Fragment, } from "react";
import { Dialog, Transition } from '@headlessui/react'
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useRouter } from "next/router";

export default function HistoryCard({ bookingData, ImagePath, Name, Location, bDate, Guests, Status, Firstname, Lastname, TableList, TableCount, PackageList, Condition, Fee, TotalPrice, LineID, LineLink, IsHistory }) {
    const [modalShow, setModalShow] = useState(false);
    const [cancletionShow, setCancletionShow] = useState(false);
    const MySwal = withReactContent(Swal);
    const [date, setDate] = useState(new Date(bDate))

    const cancelButtonRef = useRef(null)
    const router = useRouter()
    const statusColor = ["font-bold text-primary", "font-bold text-red-500"]
    
    function ShowPackage() {
        let packageCount = []
        let element

        PackageList.sort((x,y)=>x.BOOKING_PACKAGE.ID - y.BOOKING_PACKAGE.ID)

        element = PackageList.map((i, key) => {

            
            let cnt

            if (!packageCount.includes(i.BOOKING_PACKAGE.ID)) {
                packageCount.push(i.BOOKING_PACKAGE.ID)
                cnt = PackageList.filter((d) => d.BOOKING_PACKAGE.ID == i.BOOKING_PACKAGE.ID).length
                return (
                    <div key={key} className="flex flex-row justify-between mb-6">
                        <div>
                            <span>{i.BOOKING_PACKAGE.NAME} X {cnt}
                            </span>
                        </div>
                        <p>{parseInt(i.BOOKING_PACKAGE.PRICE) * cnt} THB</p>
                    </div>
                )
            }
        })
        return element
    }

    function ShowTable() {

        let element

        element = TableList.map((e, key) => {
            e.TABLE.sort((x,y)=>x.ID - y.ID)
            const undefiendCount = e.TABLE.filter((i) => i === undefined)
            if (undefiendCount.length == e.TABLE.length) {
                return
            }
            return (
                <div key={key} className="flex flex-col mb-8">
                    <p className="font-bold mb-6">{e.AREA}</p>
                    <div className="flex flex-col space-y-7">
                        {
                            e.TABLE.map((a, key) => {
                                if (a != undefined) {
                                    return (
                                        <p key={key} className="">
                                            Table {a.NAME} (For {a.SEATS_AMOUNT} Person)
                                        </p>
                                    )
                                }
                            })
                        }

                    </div>
                </div>
            )
        })
        return element
    }
    const onClickCancel = async (e, data) => {
        const endpoint = `/api/action/booking/upsert`;

        let JSONdata = JSON.stringify({
            id: data.ID,
            restaurantId: data.RESTAURANT_ID,
            customerId: data.CUSTOMER_ID,
            guestsAmount: data.GUESTS_AMOUNT,
            bookDatetime: data.BOOK_DATETIME,
            totalPrice: data.TOTAL_PRICE,
            status: 'Cancel',
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
            const result = await response.json();
            router.reload()
        } catch (error) {
            const MySwal = withReactContent(Swal)
            MySwal.fire({ title: "Error", text: error, icon: "error", confirmButtonText: "close" })
        }

    };
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
    return (
        <>
            <div className="lg:flex flex-row space-x-6 rounded-lg p-6 border-1 border-gray-500 hidden w-fit xs:mx-auto sm:mx-0 mb-12">
                <div className="lg:flex flex-row space-x-6">
                    <div>
                        <img src={ImagePath} alt="" className='w-44 h-36 rounded-md ' />
                    </div>
                    <div className="flex flex-col justify-between">
                        <div className="w-64 overflow-ellipsis overflow-hidden">
                            <p className="font-bold mb-2">{Name}</p>
                            <div className="flex flex-row">
                                <i className="fas fa-map-marker-alt self-center mr-1"></i>
                                <p>{Location}</p>
                            </div>
                        </div>
                        <div className="flex flex-row space-x-8">
                            <div>
                                <p className="font-bold">Dates</p>
                                <p>{date.toLocaleString("en").split(' ')[0].split("/")[1]} {month[Number(date.toLocaleString("en").split(' ')[0].split("/")[0]) -1]} {date.toLocaleString("en").split(' ')[0].split("/")[2].split(",")}</p>
                            </div>
                            <div>
                                <p className="font-bold">Guests</p>
                                <p>
                                    {Guests}
                                    &nbsp;
                                    Person
                                    {/* {parseInt(Guests) > 1 ? "People" : "Person"} */}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between">
                    <div>
                        <p className="font-bold  mb-2">Status</p>
                        <p className={(Status == "Confirm" || Status == "Pending") ? statusColor[0] : statusColor[1]}>{Status}</p>
                    </div>

                    <div>
                        <button className="font-bold underline underline-offset-1" onClick={() => {
                            setModalShow(true); ShowTable()

                        }}>See detail</button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-y-4 rounded-lg p-4 border-1 border-gray-500 lg:hidden xs:w-12/12 w-fit mb-5 overflow-x-auto">
                <div className="flex flex-row space-x-4">
                    <img src={ImagePath} alt="" className='w-20 h-14 rounded-md ' />
                    <div>
                        <p className="font-bold text-xs">{Name}</p>
                        <div className="flex flex-row text-xs">
                            <i className="fas fa-map-marker-alt self-center mr-1"></i>
                            <p>{Location}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row space-x-8 w-full">
                    <div className="flex flex-row space-x-6 justify-start w-full">
                        <div>
                            <p className="font-bold text-xs">Dates</p>
                            <p className="text-xs">{date.toLocaleString("en").split(' ')[0].split("/")[1]} {month[Number(date.toLocaleString("en").split(' ')[0].split("/")[0]) -1]} {date.toLocaleString("en").split(' ')[0].split("/")[2].split(",")}</p>
                        </div>
                        <div>
                            <p className="font-bold text-xs">Guests</p>
                            <p className="text-xs">
                                {Guests}
                                &nbsp;
                                Person
                                {/* {parseInt(Guests) > 1 ? "People" : "Person"} */}
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-xs">Status</p>
                            <p className={(Status == "Confirm" || Status == "Pending") ? statusColor[0] : statusColor[1]}><p className="text-xs">{Status}</p></p>
                        </div>

                        <div className="flex justify-end">
                            <p className="font-bold underline underline-offset-1 text-xs align-text-bottom self-end cursor-pointer" onClick={() => {
                                setModalShow(true); ShowTable()
                            }}>See detail</p>
                        </div>
                    </div>
                </div>
            </div>

            <Transition.Root show={modalShow} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setModalShow}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 h-full overflow-y-auto">
                        <div className="flex sm:items-center justify-center xs:p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative bg-white rounded-md text-left overflow-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-8 flex flex-col ">
                                    <div className="flex flex-row justify-between mb-12">
                                        <div></div>
                                        <h1 className="text-xl font-bold">Booking summary</h1>
                                        <i className="fas fa-times cursor-pointer self-center" onClick={() => { setModalShow(false) }}></i>
                                    </div>

                                    <div className="mb-12">
                                        <h2 className="font-bold text-lg mb-8">Booking name</h2>
                                        <div className="flex flex-row space-x-3">
                                            <div className="flex flex-col">
                                                <p className="font-bold mb-6">Name</p>
                                                <p>{Firstname}</p>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-bold mb-6">Surname</p>
                                                <p>{Lastname}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-lg mb-8">Zone & tables</h2>

                                        <ShowTable />

                                        <div className="flex flex-row font-bold justify-between mb-12 text-lg">
                                            <p>Total</p>
                                            <p>{TableCount} Tables select</p>
                                        </div>
                                    </div>

                                    <div className="mb-12">
                                        <h2 className="font-bold text-lg mb-8">Price detail</h2>

                                        <ShowPackage />

                                        <div className="flex flex-row text-base justify-between mt-0.5">
                                            <div>
                                                <span>Service Fee</span>
                                            </div>
                                            <p>{Fee} THB</p>
                                        </div>

                                        <div className="flex flex-row font-bold text-lg justify-between mt-8">
                                            <p>Total</p>
                                            <p>{TotalPrice} THB</p>
                                        </div>
                                    </div>

                                    <div className="mb-12">
                                        <h2 className="font-bold text-lg mb-8">Condition</h2>

                                        <div className="text-primary">
                                            <div className='w-full break-words font-bold' dangerouslySetInnerHTML={{ __html: String(Condition) }}></div>
                                        </div>
                                    </div>

                                    {
                                        !IsHistory && <div className="flex flex-row justify-end">
                                            {Status == "Confirm" ? <button className="font-bold underline" onClick={() => {
                                                if (Status == "Confirm") {
                                                    setCancletionShow(true); setModalShow(false)
                                                }

                                            }}>Cancle booking</button> : <></>}

                                            {Status == "Pending" ? <button className="font-bold underline" onClick={(e) => {
                                                if (Status == "Pending") {
                                                    MySwal.fire({
                                                        title: "ยกเลิกการจอง",
                                                        text: "คุณต้องการยกเลิกการจองนี้ใช่หรือไม่",
                                                        icon: "question",
                                                        showCancelButton: true,
                                                        cancelButtonText: "No",
                                                        confirmButtonText: "Yes",
                                                        showLoaderOnConfirm: true,
                                                        preConfirm(inputValue) {
                                                            //DO FUNCTION HERE
                                                            onClickCancel(e, bookingData)
                                                        },
                                                    })
                                                }
                                            }}>Cancle booking</button> : <></>}

                                        </div>
                                    }


                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <Transition.Root show={cancletionShow} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setCancletionShow}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex sm:items-center justify-center overflow-y-auto p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative bg-white rounded-md text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-5 flex flex-col space-y-8">
                                    <div className="flex flex-row justify-between">
                                        <h1 className="text-xl font-bold">Cancle booking</h1>
                                        <i className="fas fa-times cursor-pointer self-center" onClick={() => { setCancletionShow(false) }}></i>
                                    </div>

                                    <div>
                                        <p>Please cancel the booking via Line OA in the rich menu section</p>
                                    </div>

                                    <div>
                                        <p>Line {LineID}</p>
                                    </div>

                                    <div>
                                        <p>or click <a href={LineLink} className="hover:underline">{LineLink}</a></p>
                                    </div>

                                    <div className="">
                                        <img src="/img/QRCODE_LINE.PNG" alt="" className="max-h-56 mx-auto" />
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    );
}
