"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db ,auth} from '../../firebaseConfig';
const availableDates = ['1 August 2024', '2 August 2024', '3 August 2024'] as const;

type AvailableRooms = {
  [key in typeof availableDates[number]]: string;
};

const EditBookingPlace = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string | string[] }>();
  const [bookingPlace, setBookingPlace] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
    const fetchBookingPlace = async () => {
      if (id) {
        const decodedId = Array.isArray(id) ? id[0] : id;
        const docRef = doc(db, 'bookingPlaces', decodeURIComponent(decodedId));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBookingPlace({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("this eoro");
          setError('Booking place not found');
        }
        setLoading(false);
      }
    };

    fetchBookingPlace();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingPlace((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailableRoomsChange = (date: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setBookingPlace((prev: any) => ({
      ...prev,
      availableRooms: {
        ...prev.availableRooms,
        [date]: Number(value),
      },
    }));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bookingPlace) {
      const decodedId = Array.isArray(id) ? id[0] : id;
      const docRef = doc(db, 'bookingPlaces', decodeURIComponent(decodedId));
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError('Document not found. Please verify the ID.');
        return;
      }
      await updateDoc(docRef, bookingPlace);
      router.push('/editBookingPlace');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Edit Booking Place</h1>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label className="form-label">Accommodation Type</label>
          <select
            name="type"
            value={bookingPlace.type}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="" disabled>Select accommodation type</option>
            <option value="Hotel">Hotel</option>
            <option value="Hostel">Hostel</option>
            <option value="Apartment">Apartment</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            name="location"
            value={bookingPlace.location}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={bookingPlace.description}
            onChange={handleChange}
            className="form-control"
            rows={4}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price per Room</label>
          <input
            type="number"
            name="pricePerRoom"
            value={bookingPlace.pricePerRoom}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <h5>Available Rooms:</h5>
        {availableDates.map((date) => (
          <div className="mb-3" key={date}>
            <label className="form-label">{date}</label>
            <input
              type="number"
              name={`availableRooms[${date}]`}
              value={bookingPlace.availableRooms[date] || 0}
              onChange={(e) => handleAvailableRoomsChange(date, e)}
              className="form-control"
              required
            />
          </div>
        ))}

        <button type="submit" className="btn btn-primary">Update Booking Place</button>
      </form>
    </div>
  );
};

export default EditBookingPlace;
