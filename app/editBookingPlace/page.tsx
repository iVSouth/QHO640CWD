"use client";
import { useEffect, useState } from 'react';
import { db,auth  } from '../firebaseConfig';
import { collection, getDocs,getDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 


interface AvailableRooms {
  [date: string]: number;
}

interface BookingPlace {
  id: string;
  type: string;
  location: string;
  description: string;
  pricePerRoom: number;
  availableRooms: AvailableRooms;
}

const EditBookingPlace = () => {
  const router = useRouter();
  const [bookingPlaces, setBookingPlaces] = useState<BookingPlace[]>([]);
  const [error, setError] = useState<string>('');

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

  useEffect(() => {
    const fetchBookingPlaces = async () => {
      
      try {
        const placesCollection = collection(db, 'bookingPlaces');
        const snapshot = await getDocs(placesCollection);
        console.log("Faf");
        const placesList: BookingPlace[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BookingPlace[];
        setBookingPlaces(placesList);
      } catch (err) {
        setError('Failed to fetch booking places.');
      }
    };


  

    fetchBookingPlaces();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this booking place?")) {
      try {
        const docRef = doc(db, 'bookingPlaces', id);
        await deleteDoc(docRef);
        setBookingPlaces(bookingPlaces.filter(place => place.id !== id));
      } catch (err) {
        setError('Failed to delete booking place.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Edit Booking Places</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Accommodation Type</th>
            <th>Location</th>
            <th>Description</th>
            <th>Price</th>
            <th>Available Rooms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookingPlaces.map((place) => (
            <tr key={place.id}>
              <td>{place.type}</td>
              <td>{place.location}</td>
              <td>{place.description}</td>
              <td>
                ${typeof place.pricePerRoom === 'number' ? place.pricePerRoom.toFixed(2) : place.pricePerRoom}
              </td>
              <td>
                {place.availableRooms ? Object.entries(place.availableRooms).map(([date, rooms]) => (
                  <div key={date}>{date}: {rooms} rooms</div>
                )) : 'N/A'}
              </td>
              <td>
                <Link href={`/editPlace/${place.id}`} className="btn btn-warning btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(place.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditBookingPlace;
