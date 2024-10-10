"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

type AvailableDate = "1 August 2024" | "2 August 2024" | "3 August 2024";
const availableDates: AvailableDate[] = ["1 August 2024", "2 August 2024", "3 August 2024"];

const BookingPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookingPlaces, setBookingPlaces] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchTerm1, setSearchTerm1] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<AvailableDate>('1 August 2024');
  const [numberOfRooms, setNumberOfRooms] = useState<number>(1);
  const [nights, setNights] = useState<number>(1);
  const [userEmail, setUserEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setUserEmail(user.email || '');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchBookingPlaces = async () => {
      const snapshot = await getDocs(collection(db, 'bookingPlaces'));
      const places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(places);
      setBookingPlaces(places);
    };

    fetchBookingPlaces();
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      const place = bookingPlaces.find(p => p.id === selectedPlace);
      if (place) {
        const calculatedPrice = place.pricePerRoom * numberOfRooms * nights;
        setTotalPrice(calculatedPrice);
      }
    }
  }, [selectedPlace, numberOfRooms, nights, bookingPlaces]);

  const filteredPlaces = bookingPlaces.filter(place => 
    place.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
    place.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const place = bookingPlaces.find(p => p.id === selectedPlace);
    if (!place || !selectedDate || !userEmail) {
      setError('Please select a place, date, and ensure you are logged in.');
      return;
    }

    const startIndex = availableDates.indexOf(selectedDate);
    const endIndex = startIndex + nights;
    if (endIndex > availableDates.length) {
      setError(`Only accommodations from ${availableDates[startIndex]} to 3 August 2024 are available.`);
      return;

    }

    let canBook = true;
    const datesToBook = availableDates.slice(startIndex, endIndex);
    for (const date of datesToBook) {
      const availableRooms = place.availableRooms[date] || 0;
      if (availableRooms < numberOfRooms) {
        canBook = false;
      break;

      }
    }

    if (!canBook) {
      setError(`Not enough available rooms from ${selectedDate} for ${nights} night(s).`);
      return;
    }

    const docRef = doc(db, 'bookingPlaces', selectedPlace);
    for (const date of datesToBook) {
      const availableRooms = place.availableRooms[date];
      await updateDoc(docRef, {
        [`availableRooms.${date}`]: availableRooms - numberOfRooms,
      });
    }

    await addDoc(collection(db, 'bookings'), {
      email: userEmail,
      place: place.location,
      date: selectedDate,
      numberOfRooms,
      nights,
      bookingDates: datesToBook,
      bookingPlaceId: selectedPlace,
      totalPrice, 
    });

    setSuccess(`Successfully booked ${numberOfRooms} room(s) for ${nights} night(s) from ${selectedDate}. Total price: $${totalPrice.toFixed(2)}`);
    setSelectedPlace('');
    setSelectedDate('1 August 2024');
    setNumberOfRooms(1);
    setNights(1);
    setUserEmail(user?.email || '');
    setSearchTerm('');
    setTotalPrice(0);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Book Your Accommodation</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleBooking}>
        <div className="mb-3">
          <label className="form-label">Search Accommodation</label>
          <div className="dropdown">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchTerm1(e.target.value);
              }}
              className="form-control dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="true"
              placeholder="Search by location or type"
              id="searchDropdown"
              onFocus={() => {
                setSearchTerm(searchTerm);
                setSearchTerm1(searchTerm);
              }}
            />
            {searchTerm1 && (
              <ul className="dropdown-menu show" aria-labelledby="searchDropdown">
                {filteredPlaces.length > 0 ? (
                  filteredPlaces.map(place => (
                    <li key={place.id}>
                      <a 
                        className="dropdown-item" 
                        onClick={() => {
                          setSelectedPlace(place.id);
                          setSearchTerm(`${place.location} - ${place.type}`);
                          setSearchTerm1('');
                        }}
                      >
                        {place.location} - {place.type}
                      </a>
                    </li>
                  ))
                ) : null}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Select Start Date</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value as AvailableDate)}
            className="form-select"
            required
          >
            <option value="" disabled>Select a date</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Number of Rooms</label>
          <input
            type="number"
            value={numberOfRooms}
            onChange={(e) => setNumberOfRooms(Number(e.target.value))}
            min={1}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Number of Nights</label>
          <input
            type="number"
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            min={1}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Total Price</label>
          <input
            type="text"
            value={`$${totalPrice.toFixed(2)}`}
            className="form-control"
            readOnly
          />
        </div>

        <button type="submit" className="btn btn-primary">Book Now</button>
      </form>
    </div>
  );
};

export default BookingPage;
