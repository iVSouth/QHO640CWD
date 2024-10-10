"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';


import { useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { setDoc, doc ,getDoc} from "firebase/firestore";

import { db } from '../firebaseConfig';

const availableDates = ['1 August 2024', '2 August 2024', '3 August 2024'] as const;

type AvailableRooms = {
  [key in typeof availableDates[number]]: string;
}

const AddBookingPlace = () => {

  const router = useRouter();
  const [bookingPlace, setBookingPlace] = useState({
    type: '',
    location: '',
    availableRooms: {} as AvailableRooms,
    description: '',
    pricePerRoom: '',
  });
  const [error, setError] = useState('');

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


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('rooms')) {
      const date = name.split('_')[1] as typeof availableDates[number];
      setBookingPlace((prev) => ({
        ...prev,
        availableRooms: { ...prev.availableRooms, [date]: value },
      }));
    } else {
      setBookingPlace((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'bookingPlaces', `${bookingPlace.type}_${bookingPlace.location}`);
      await setDoc(docRef, bookingPlace);
      
    console.log(docRef);
      router.push('/AdminDashboard');
    } catch (error) {
      setError('Failed to add booking place.');
      
    console.log("Erro is",error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Add Booking Place</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Accommodation Type</label>
          <select
            className="form-select"
            id="type"
            name="type"
            value={bookingPlace.type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Hotel">Hotel</option>
            <option value="Hostel">Hostel</option>
            <option value="Apartment">Apartment</option>
            <option value="Guest House">Guest House</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label htmlFor="location" className="form-label">Location</label>
          <select
            className="form-select"
            id="location"
            name="location"
            value={bookingPlace.location}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Location</option>
            <option value="New York">New York</option>
            <option value="Los Angeles">Los Angeles</option>
            <option value="Chicago">Chicago</option>
            <option value="Miami">Miami</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Available Rooms</label>
          <ul className="list-group">
            {availableDates.map((date) => (
              <li className="list-group-item" key={date}>
                <div className="d-flex justify-content-between">
                  <span>{date}</span>
                  <input
                    type="number"
                    className="form-control w-50"
                    name={`rooms_${date}`}
                    value={bookingPlace.availableRooms[date] || ''}
                    onChange={handleInputChange}
                    placeholder="Number of rooms"
                    required
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows={3}
            value={bookingPlace.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        
        <div className="mb-3">
          <label htmlFor="pricePerRoom" className="form-label">Price for Single Room</label>
          <input
            type="number"
            className="form-control"
            id="pricePerRoom"
            name="pricePerRoom"
            value={bookingPlace.pricePerRoom}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Add Booking Place</button>
      </form>
    </div>
  );
};

export default AddBookingPlace;
