import React from "react";

// components

export default function CardEventCard() {
    return (
        <>
            <div className="relative flex flex-col event-card min-w-0 mb-6 mx-auto">
                <img className=" rounded-lg mb-6" src="https://www.w3schools.com/w3css/img_lights.jpg" alt="" />
                <span className="font-bold">[date]</span>
                <div className="flex items-center">
                    <div className="text-secondary mr-2">
                        <i className="fas fa-map-marker"></i>
                    </div>
                    <div>
                        <p>[location]</p>
                    </div>
                </div>

            </div>
        </>
    );
}
