"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebaseConfig';

import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

export default function AdminDashboard() {

  const router = useRouter();

  useEffect(() => {

    const verifyAdmin = async () => {
    const user = auth.currentUser;

      if (!user) {
        router.push('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData || userData.category !== 'admin') {
        router.push('/login');
      }
    };

    verifyAdmin();
  }, [router]);

  const handleCheckBookings = () => {
    router.push('/checkBookings');
  };

  const handleAddBookingPlace = () => {
    router.push('/addBookingPlace');
  };

  const handleEditBookingPlace = () => {
    router.push('/editBookingPlace');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Admin Dashboard</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="text-center">Options</h3>
              <div className="d-grid gap-2">
                <button className="btn btn-primary" onClick={handleCheckBookings}>
                  Check Bookings
                </button>
                <button className="btn btn-secondary" onClick={handleAddBookingPlace}>
                  Add Booking Place
                </button>
                <button className="btn btn-warning" onClick={handleEditBookingPlace}>
                  Edit Booking Place
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
