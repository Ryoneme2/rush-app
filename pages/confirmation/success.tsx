/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Link from "next/link";

import { useState, Fragment, useRef, } from "react";
import { Dialog, Transition } from '@headlessui/react'

import { useRouter } from 'next/router'

import MobileNavbar from "components/Navbars/IndexMobileNavbar";
import Secondary from "layouts/Secondary";

function success() {


    return (
        <div className="container mx-auto flex flex-col px-6">
            <div className="w-full flex flex-row pt-5 pb-12">
                <Link href="/">
                    <button className="text-primary text-4xl font-bold ">
                        RUSH
                    </button>
                </Link>
            </div>
            <div className="pb-20">
                <h1 className="text-xl font-bold pb-12">ระบบได้รับคำขอในการจองโต๊ะของท่านแล้ว</h1>
                <p className="pb-12">ตอนนี้โต๊ะ, แพ็คเกจหรือโปรโมชั่นทั้งหมดที่จองได้ถูกสำรองที่นั่งไว้ให้แก่ลูกค้าแต่เพียงผู้เดียวแล้ว แต่ยังเหลือขั้นตอนสุดท้ายคือการแสดงหลักฐานการโอนเงินแก่ทีมงาน</p>
                <p className="text-primary font-bold pb-6">** โดยลูกค้ากรุณาทำตามขั้นตอนดังต่อไปนี้</p>
                <p className="text-primary pb-6">1.แอด Line OA @886jxuaj หรือคลิกลิงก์ <a href="https://lin.ee/hWLrvSM" target="_blank">https://lin.ee/hWLrvSM</a></p>
                <p className="text-primary pb-6">2.เลือกหัวข้อ "แจ้งโอนเงินจองโต๊ะทั้งแบบทั่วไปและแบบคอนเสิร์ต" ใน Rich menu พร้อมแจ้งข้อมูลตามที่มีการแสดงผลในข้อความอัตโนมัติ</p>
                <p className="text-primary pb-6">**หากการจองของลูกค้าไม่มีค่าใช้จ่าย กรุณาแจ้งข้อมูลตามที่มีการแสดงผลในข้อความอัตโนมัติทั้งหมดตามเดิม เพียงแต่ไม่ต้องส่งสลิปแสดงหลักฐานการโอนเงิน</p>
                <p className="text-primary pb-12">3.รอทางทีมงานเช็คสลิปหลักฐานการโอนเงินสักครู่และมาแจ้งยืนยันการจอง หากไม่พบปัญหาใดๆ ถือว่าการจองเสร็จสิ้น</p>
                <p className="pb-12">หมายเหตุ : ลูกค้าสามารถเข้ามาตรวจสอบสถานะการจองได้เองในหัวข้อ My booking หากมีสถานะขึ้นว่า Confirm แสดงว่าทางทีมงานได้ตรวจสอบหลักฐานการโอนเงินพร้อมทั้งอนุมัติการจองเสร็จสิ้นแล้ว</p>
                <h2 className="font-bold break-words w-11/12">ขอบคุณที่ใช้บริการกับ Rush เราและเข้าใจว่าในปัจจุบันขั้นตอนการจองอาจจะมีความยุ่งยาก ซึ่งในอนาคตเราจะพัฒนาระบบการจองให้มีความสะดวกสบายยิ่งขึ้นอย่างแน่นอนครับ</h2>
                
            </div>
            <MobileNavbar />
        </div >
    );
}

success.layout = Secondary

export default success
