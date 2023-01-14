/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Link from "next/link";


export default function Deny() {

    return (
        <div className="container mx-auto flex flex-col h-screen">
            <div className="mx-auto mt-32">
                <div className="flex flex-col text-center">
                    <p className="text-4xl mb-8 text-red-600">Access Deny</p>
                    <Link href={"/"}>
                        <p className="text-2xl underline cursor-pointer">back to main page</p>
                    </Link>
                </div>
            </div>
        </div >
    );
}
