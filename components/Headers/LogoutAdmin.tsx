import React from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";


export default function LogoutAdmin() {
    const router = useRouter();
    return (
        <>
        {/* router.push("/")  */}
            {/* Header */}
            <div className="relative bg-blueGray-800 ">
                <div className="px-4 py-3 md:px-10 mx-auto w-full">
                    <div className="flex flex-row justify-end">
                        <button className="bg-red-500 active:bg-red-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                            onClick={() => {  signOut({
                                callbackUrl: `${window.location.origin}`
                              }); localStorage.clear(); }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
