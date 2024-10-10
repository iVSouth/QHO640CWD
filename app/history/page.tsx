"use client";
import Link from 'next/link';

const HistoryPage = () => {
  return (

    <div className="container mt-5">
      <h1 className="text-center mb-4">Booking History</h1>
      <div className="alert alert-info text-center">
        
        You have no bookings completed yet.
      </div>
      <div className="text-center">
        In order to see your current bookings, please visit the <Link href="/bookings" className="btn btn-primary">Bookings Page</Link>.
      </div>
    </div>
  );
};

export default HistoryPage;
