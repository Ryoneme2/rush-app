import React from 'react';

// components

import CardStats from 'components/Cards/CardStats';

export default function HeaderStats() {
  return (
    <>
      {/* Header */}
      <div className='relative bg-blueGray-800 md:pt-32 pb-32 pt-12'>
        <div className='px-4 md:px-10 mx-auto w-full'>
          <div>{/* Card stats */}</div>
        </div>
      </div>
    </>
  );
}
