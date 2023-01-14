/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import Link from "next/link";

import Default from "layouts/Default";
import { useState } from "react";

export default function checkIn() {

    return (
        <div className="container mx-auto flex flex-col space-y-6">
            <div className="mx-auto">
                <div className="flex flex-col text-center">
                    <i className="fas fa-check-circle text-8xl mb-8"></i>
                    <p className="text-4xl">Check-in</p>
                    <p className="text-4xl mb-8">Complete</p>
                    <p className="text-2xl">Thanks you and have fun!</p>
                </div>
            </div>
        </div >
    );
}
