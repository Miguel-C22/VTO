import React from 'react';

function Loader() {
  return (
    <div className="flex mt-80 flex-col items-center justify-center ">
        <span className="loading loading-bars loading-xl"></span>
      <p className="mt-4 text-lg text-gray-600">Loading, please wait...</p>
    </div>
  );
}

export default Loader;