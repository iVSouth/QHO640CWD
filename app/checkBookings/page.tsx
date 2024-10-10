"use client"; 

import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; 
import { collection, getDocs, getDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth } from '../firebaseConfig';

const CheckBookings = () => {
 const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      const snapshot = await getDocs(collection(db, 'bookings'));
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
    };

    fetchBookings();
  }, []);

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


  const handleDelete = async (bookingId: string, bookingPlaceId: string, nights: number, bookingDates: string[]) => {

    try {

      const docRef = doc(db, 'bookings', bookingId);
      const booking = bookings.find(b => b.id === bookingId); 
  
      if (!booking) {
        return; 
      }

      
    console.log("dada");
    
    console.log(bookingId);
  
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
  
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">All Bookings</h1>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Booking ID</th>
            <th scope="col">User Email</th>
            <th scope="col">Place</th>
            <th scope="col">Start Date</th>
            <th scope="col">Nights</th>
            <th scope="col">Rooms</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.email}</td>
                <td>{booking.place}</td>
                
                <td>{booking.date}</td>
                <td>{booking.nights}</td>
                <td>{booking.numberOfRooms}</td>
                <td>
                  <button 
                    className="btn btn-danger me-2"
                    onClick={() => handleDelete(booking.id, booking.bookingPlaceId, booking.nights, booking.bookingDates)}
                  >
                    Delete
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={() => router.push(`/editBooking/${booking.id}`)}
                  >
                    Edit Booking
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">No bookings found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CheckBookings;
