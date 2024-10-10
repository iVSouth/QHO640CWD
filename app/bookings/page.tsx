"use client"; 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebaseConfig';
import { collection, doc, getDocs, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

import { signOut, User } from 'firebase/auth';

interface Booking {
  id: string;
  bookingDates: string[];
  bookingPlaceId: string;
  date: string;
  email: string;
  nights: number;
  numberOfNights: number;
  numberOfRooms: number;
  place: string;
  startingDate: string;
}

const BookingsPage: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login'); 
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email || '');
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const userBookings = bookingsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }) as Booking)
          .filter(booking => booking.email === user.email);
        setBookings(userBookings);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (bookingId: string, bookingPlaceId: string, nights: number, bookingDates: string[]) => {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        return;
      }
      const placeDocRef = doc(db, 'bookingPlaces', bookingPlaceId);
      const placeDocSnapshot = await getDoc(placeDocRef);
      const placeData = placeDocSnapshot.data();
      if (!placeData || !placeData.availableRooms) {
        return;
      }
      const availableRoomsUpdate: Record<string, number> = {};
      bookingDates.forEach((date: string) => {
        const currentAvailableRooms = placeData.availableRooms[date] || 0;
        availableRoomsUpdate[`availableRooms.${date}`] = currentAvailableRooms + booking.numberOfRooms;
      });
      await deleteDoc(docRef);
      await updateDoc(placeDocRef, availableRoomsUpdate);
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (error) {
      console.error("Error deleting booking: ", error);
    }
  };

  const handleEdit = (bookingId: string) => {
    console.log("Edit booking with ID:", bookingId);
  };

  return (
    <div className="container">
      <h1>Your Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Place</th>
              <th>Starting Date</th>
              <th>Nights</th>
              <th>Number of Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.place}</td>
                <td>{booking.date}</td>
                <td>{booking.nights}</td>
                <td>{booking.numberOfRooms}</td>

                <td>
                  <button   onClick={() => router.push(`/editUserBooking/${booking.id}`)} className="btn btn-warning">Edit</button>
                  <button onClick={() => handleDelete(booking.id, booking.bookingPlaceId, booking.nights, booking.bookingDates)} className="btn btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingsPage;
