import React, { useState } from 'react';

// components

export default function TableZoneSelectionCard({
  isReserved,
  isPick,
  zoneName,
  Guest,
  tableLocation,
}) {
  function IsPickHandle({ isReserved }) {
    if (isReserved) return <i className='fas fa-times-circle opacity-25'></i>;
    if (isPick) return <i className='fas fa-check-circle text-primary'></i>;
    return <i className='fas fa-plus-circle'></i>;
  }

  const avaliableBTN =
    'grid grid-cols-12 text-sm border-2 rounded-md shadow-md p-3 px-4 mb-3 cursor-pointer';
  const reservedBTN =
    'grid grid-cols-12 text-sm border-2 rounded-md shadow-md p-3 px-4 mb-3 cursor-not-allowed';

  return (
    <div className={isReserved === false ? avaliableBTN : reservedBTN}>
      <div className='col-span-6 flex flex-col'>
        <p className='text-primary font-bold'>{zoneName}</p>
        <p>
          For {Guest} {Guest > 1 ? 'People' : 'Person'}
        </p>
      </div>
      <div className='col-span-4 text-center flex-col text-primary font-bold'>
        <p>Table</p>
        <p>{tableLocation}</p>
      </div>
      <div className='col-span-2 place-self-end self-center text-2xl'>
        <IsPickHandle isReserved={isReserved} />
      </div>
    </div>
  );
}
