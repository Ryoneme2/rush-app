/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import { verify } from "jsonwebtoken";
import { useState, Fragment, } from "react";
import { Dialog, Transition } from '@headlessui/react'


import HistoryCard from "components/Frontend/Card/HistoryCard";
import { useRouter } from 'next/router';
import { PrismaClient } from "@prisma/client";
import AccountLayout from "layouts/Account";


export async function getServerSideProps(ctx) {
    // const router = useRouter()
    const session = await getSession(ctx)
    if (!session) {
        return { redirect: { destination: '/' } }
    }


    const prisma = new PrismaClient();

    const secretKey: string = process.env.JWT_SECRET;
    const user = await verify(session.tokenUser, secretKey)

    const response = await prisma.bOOKING.findMany({
        where: { CUSTOMER_ID: parseInt(user.ID) },
        include: { RESTAURANT: { select: { NAME: true, DESCRIPTION: true, ADDRESS: true, WORK_HOURS_DESCRIPTION: true, CONDITION: true, FEE: true, RESTAURANT_GALLERY: { where: { IS_ACTIVE: true } } } }, BOOKING_TABLES: { select: { TABLE: { select: { ID: true, NAME: true, SEATS_AMOUNT: true, AREA: true } } } }, BOOKING_PACKAGE_SELECT: { select: { BOOKING_PACKAGE: true } } },
        orderBy: [{ BOOK_DATETIME: "desc" }],
        // skip:1,
        take:35
    });
    await prisma.$disconnect()

    const data = JSON.parse(JSON.stringify(response))
    // console.log(data.length);
    
    


    // Pass data to the page via props
    return { props: { data } }
}

export default function MyBooking({ data }) {

    const { data: session } = useSession();
    const [throwData, setThrowData] = useState(data);
    let area = []
    let dataArea = []

    data.map((d) => {
        d.BOOKING_TABLES.map((bt) => {
            if (!area.includes(bt.TABLE.AREA.NAME)) {
                area.push(bt.TABLE.AREA.NAME)
            }
        })
    })


    area.map((a) => {
        dataArea.push(
            data.map((d) => {
                return {
                    AREA: a, TABLE:
                        d.BOOKING_TABLES.map((bt) => {
                            if (area.includes(bt.TABLE.AREA.NAME) && a == bt.TABLE.AREA.NAME) {
                                return { ID:bt.TABLE.ID, NAME: bt.TABLE.NAME, SEATS_AMOUNT: bt.TABLE.SEATS_AMOUNT }
                            }
                        })
                }
            }))
    })
    
    
    data.map((i, index) => {
        i.ZONETABLE = []
        dataArea.map((a, ind) => {

            if (dataArea[ind][index] != undefined) {


                i.ZONETABLE.push(dataArea[ind][index])
            }
        })
    })


    const [menu, setMenu] = useState("Confirm")

    const [nowDate, setNowDate] = useState(new Date())

    const [confirmationList, setConfirmList] = useState(data)

    const activeBTN = "text-primary underline underline-offset-4 underline-thickness"

    function IsHistoryNull() {
        return (
            <div className="sm:rounded-lg flex flex-row md:border md:border-black bg-primary">
                <div className="py-8 md:pl-8 md:pr-5 w-full md:w-6/12 lg:w-5/12 bg-white sm:rounded-lg">
                    <div className="md:w-full lg:w-8/12">
                        <h2 className="font-bold text-xl mb-4">No booking have been made.</h2>
                        <p className="mb-12">It's time to explore a fun night that will be one you will remember for a long time!</p>
                        <Link href="/">
                            <button className="bg-primary font-bold text-white w-full py-2 rounded-lg">Explore</button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    function IsHistoryNotNull() {
        let element
        let confirmCount = 0
        let pendingCount = 0
        let historyCount = 0

        if (menu == "Confirm") {
            let totalPrice = 0;
            element = confirmationList.map((i, index) => {
                totalPrice = 0;
                i.BOOKING_PACKAGE_SELECT.map((e) => {
                    totalPrice += parseFloat(e.BOOKING_PACKAGE.PRICE)
                })

                if (i.STATUS == "Confirm" && new Date(i.BOOK_DATETIME) >= new Date(new Date().setUTCHours(0, 0, 0, 0))) {
                    confirmCount += 1
                    return (
                        <HistoryCard key={"Confirm-" + index + 1} IsHistory={false} bookingData={throwData[index]} ImagePath={i.RESTAURANT?.RESTAURANT_GALLERY[0]?.FILE_PATH} Name={i.RESTAURANT.NAME} bDate={new Date(i.BOOK_DATETIME)} Guests={i.GUESTS_AMOUNT} Location={i.RESTAURANT.ADDRESS} Status="Confirm" Firstname={!session?.fname ? '' : String(session.fname)} Lastname={!session?.lname ? '' : String(session.lname)} TableList={i.ZONETABLE} TableCount={i.BOOKING_TABLES.length} PackageList={i.BOOKING_PACKAGE_SELECT} Condition={i.RESTAURANT?.CONDITION} Fee={totalPrice * parseFloat(i.RESTAURANT.FEE) / 100} TotalPrice={totalPrice + (totalPrice * parseFloat(i.RESTAURANT.FEE) / 100)} LineID="@886jxuaj" LineLink="https://lin.ee/hWLrvSM" />
                    )
                }
            })

            if (confirmCount == 0) {
                element = IsHistoryNull()
            }
        }


        if (menu == "Pending") {
            let totalPrice = 0;
            element = confirmationList.map((i, index) => {

                totalPrice = 0;
                i.BOOKING_PACKAGE_SELECT.map((e) => {
                    totalPrice += parseFloat(e.BOOKING_PACKAGE.PRICE)
                })
                
                // console.log(i);
                

                if (i.STATUS == "Pending" && new Date(i.BOOK_DATETIME) >= new Date(new Date().setDate(new Date().getDate()-1))) {
                    pendingCount += 1
                    // console.log(new Date(i.BOOK_DATETIME));
                    // console.log(i);
                    
                    return (
                        <HistoryCard key={"Pending-" + index + 1} IsHistory={false} bookingData={throwData[index]} ImagePath={i.RESTAURANT?.RESTAURANT_GALLERY[0]?.FILE_PATH} Name={i.RESTAURANT.NAME} bDate={new Date(i.BOOK_DATETIME)} Guests={i.GUESTS_AMOUNT} Location={i.RESTAURANT.ADDRESS} Status="Pending" Firstname={!session?.fname ? '' : String(session.fname)} Lastname={!session?.lname ? '' : String(session.lname)} TableList={i.ZONETABLE} TableCount={i.BOOKING_TABLES.length} PackageList={i.BOOKING_PACKAGE_SELECT} Condition={i.RESTAURANT?.CONDITION} Fee={totalPrice * parseFloat(i.RESTAURANT.FEE) / 100} TotalPrice={totalPrice + (totalPrice * parseFloat(i.RESTAURANT.FEE) / 100)} LineID="@886jxuaj" LineLink="https://lin.ee/hWLrvSM" />
                    )
                }
            })

            if (pendingCount == 0) {
                element = IsHistoryNull()
            }
        }

        if (menu == "History") {
            let totalPrice = 0;
            element = confirmationList.map((i, index) => {
                totalPrice = 0;
                i.BOOKING_PACKAGE_SELECT.map((e) => {
                    totalPrice += parseFloat(e.BOOKING_PACKAGE.PRICE)
                })

                if (i.STATUS == "Confirm" && new Date(i.BOOK_DATETIME) < nowDate) {
                    historyCount += 1
                    return (
                        <HistoryCard key={"History-" + index + 1} IsHistory={true} bookingData={throwData[index]} ImagePath={i.RESTAURANT?.RESTAURANT_GALLERY[0]?.FILE_PATH} Name={i.RESTAURANT.NAME} bDate={new Date(i.BOOK_DATETIME)} Guests={i.GUESTS_AMOUNT} Location={i.RESTAURANT.ADDRESS} Status="Confirm" Firstname={!session?.fname ? '' : String(session.fname)} Lastname={!session?.lname ? '' : String(session.lname)} TableList={i.ZONETABLE} TableCount={i.BOOKING_TABLES.length} PackageList={i.BOOKING_PACKAGE_SELECT} Condition={i.RESTAURANT?.CONDITION} Fee={totalPrice * parseFloat(i.RESTAURANT.FEE) / 100} TotalPrice={totalPrice + (totalPrice * parseFloat(i.RESTAURANT.FEE) / 100)} LineID="@886jxuaj" LineLink="https://lin.ee/hWLrvSM" />
                    )
                }

                if (i.STATUS == "Reject") {
                    historyCount += 1
                    return (
                        <HistoryCard key={"History-" + index + 1} IsHistory={true} bookingData={throwData[index]} ImagePath={i.RESTAURANT?.RESTAURANT_GALLERY[0]?.FILE_PATH} Name={i.RESTAURANT.NAME} bDate={new Date(i.BOOK_DATETIME)} Guests={i.GUESTS_AMOUNT} Location={i.RESTAURANT.ADDRESS} Status="Reject" Firstname={!session?.fname ? '' : String(session.fname)} Lastname={!session?.lname ? '' : String(session.lname)} TableList={i.ZONETABLE} TableCount={i.BOOKING_TABLES.length} PackageList={i.BOOKING_PACKAGE_SELECT} Condition={i.RESTAURANT?.CONDITION} Fee={totalPrice * parseFloat(i.RESTAURANT.FEE) / 100} TotalPrice={totalPrice + (totalPrice * parseFloat(i.RESTAURANT.FEE) / 100)} LineID="@886jxuaj" LineLink="https://lin.ee/hWLrvSM" />
                    )
                }

                if (i.STATUS == "Cancel") {
                    historyCount += 1
                    return (
                        <HistoryCard key={"History-" + index + 1} IsHistory={true} bookingData={throwData[index]} ImagePath={i.RESTAURANT?.RESTAURANT_GALLERY[0]?.FILE_PATH} Name={i.RESTAURANT.NAME} bDate={new Date(i.BOOK_DATETIME)} Guests={i.GUESTS_AMOUNT} Location={i.RESTAURANT.ADDRESS} Status="Cancel" Firstname={!session?.fname ? '' : String(session.fname)} Lastname={!session?.lname ? '' : String(session.lname)} TableList={i.ZONETABLE} TableCount={i.BOOKING_TABLES.length} PackageList={i.BOOKING_PACKAGE_SELECT} Condition={i.RESTAURANT?.CONDITION} Fee={totalPrice * parseFloat(i.RESTAURANT.FEE) / 100} TotalPrice={totalPrice + (totalPrice * parseFloat(i.RESTAURANT.FEE) / 100)} LineID="@886jxuaj" LineLink="https://lin.ee/hWLrvSM" />
                    )
                }

                if (i.STATUS == "Refund") {
                    historyCount += 1
                    return (
                        <HistoryCard key={"History-" + index + 1} IsHistory={true} bookingData={throwData[index]} ImagePath={i.RESTAURANT?.RESTAURANT_GALLERY[0]?.FILE_PATH} Name={i.RESTAURANT.NAME} bDate={new Date(i.BOOK_DATETIME)} Guests={i.GUESTS_AMOUNT} Location={i.RESTAURANT.ADDRESS} Status="Refund" Firstname={!session?.fname ? '' : String(session.fname)} Lastname={!session?.lname ? '' : String(session.lname)} TableList={i.ZONETABLE} TableCount={i.BOOKING_TABLES.length} PackageList={i.BOOKING_PACKAGE_SELECT} Condition={i.RESTAURANT?.CONDITION} Fee={totalPrice * parseFloat(i.RESTAURANT.FEE) / 100} TotalPrice={totalPrice + (totalPrice * parseFloat(i.RESTAURANT.FEE) / 100)} LineID="@886jxuaj" LineLink="https://lin.ee/hWLrvSM" />
                    )
                }
            })

            if (historyCount == 0) {
                element = IsHistoryNull()
            }


        }



        return element
    }

    return (
        <>
            <div className="container mx-auto hidden lg:flex flex-col px-0 mb-20">
                <div className="mt-5 mb-7 px-0">
                    <h1 className="font-bold text-2xl mb-10 mt-6">My Booking</h1>
                    <div className="flex flex-row space-x-6 font-bold">
                        <button className={menu == "Confirm" ? activeBTN : null} onClick={() => { setMenu("Confirm") }}>Confirmation</button>
                        <button className={menu == "Pending" ? activeBTN : null} onClick={() => { setMenu("Pending") }}>Pending</button>
                        <button className={menu == "History" ? activeBTN : null} onClick={() => { setMenu("History") }}>History</button>
                    </div>
                </div>
                <IsHistoryNotNull />
            </div>

            <div className="container mx-auto flex lg:hidden flex-col px-6 mb-20">
                <div className="mt-5 mb-8 px-0">
                    <h1 className="font-bold text-2xl mb-10 mt-6">My Booking</h1>
                    <div className="flex flex-row space-x-6 font-bold">
                        <button className={menu == "Confirm" ? activeBTN : null} onClick={() => { setMenu("Confirm") }}>Confirmation</button>
                        <button className={menu == "Pending" ? activeBTN : null} onClick={() => { setMenu("Pending") }}>Pending</button>
                        <button className={menu == "History" ? activeBTN : null} onClick={() => { setMenu("History") }}>History</button>
                    </div>
                </div>
                <IsHistoryNotNull />
            </div>
        </>
    );
}

MyBooking.layout = AccountLayout;
