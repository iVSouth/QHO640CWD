"use client"; 

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; 
import { useParams } from 'next/navigation'; 

import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db ,auth } from "../../firebaseConfig"; 

const EditBooking = () => {
  const router = useRouter();
  const { id: bookingId } = useParams(); 
  const [numberOfRooms, setNumberOfRooms] = useState<number>(0);
  const [startingDate, setStartingDate] = useState<string>(""); 
  const [numberOfNights, setNumberOfNights] = useState<number>(0); 
  const [place, setPlace] = useState<string>("");
  const [bookingPlaceId, setbookingPlaceId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>(""); 

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
    if (!bookingId) return;

    const fetchBooking = async () => {

      try {
        const id = Array.isArray(bookingId) ? bookingId[0] : bookingId;
        
        
        const bookingRef = doc(db, "bookings", id); 
        const bookingSnap = await getDoc(bookingRef);
      
      
    console.log("asddada");
    
    console.log(bookingRef);
  

        if (bookingSnap.exists()) {
          const bookingData = bookingSnap.data();
          console.log(bookingData);
          setNumberOfRooms(bookingData?.numberOfRooms || 0);
          console.log(bookingData?.date);
          setStartingDate(bookingData?.date || "");
          setNumberOfNights(bookingData?.nights || 0); 
          setPlace(bookingData?.place || "");
          setbookingPlaceId(bookingData?.bookingPlaceId || "");
        } else {
          console.error("No such booking found!");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); 

    try {
        const id = Array.isArray(bookingId) ? bookingId[0] : bookingId;
        const bookingRef = doc(db, "bookings", id);
        const placeDocRef = doc(db, 'bookingPlaces', bookingPlaceId);
        const bookingPlaceSnap = await getDoc(placeDocRef);

        if (!bookingPlaceSnap.exists()) {
            setError("No such place found!");
            return;
        }

        const bookingPlaceData = bookingPlaceSnap.data();
        const previousBooking = await getDoc(bookingRef);
        const previousBookingData = previousBooking.data();

        if (!previousBookingData) {
            setError("No previous booking data found!");
            return;
        }

        const oldStartingDate = previousBookingData.date;
        const oldNumberOfNights = previousBookingData.nights;
        const oldNumberOfRooms = previousBookingData.numberOfRooms;

        const roomsAvailability = bookingPlaceData.availableRooms || {};
        console.log("Rooms Availability:", roomsAvailability);
        console.log("fsaddddddddd");
        console.log(startingDate)


        for (let i = 0; i < numberOfNights; i++) {
            const newDate = getDateStringByOffset(startingDate, i);
            console.log(`Checking availability for: ${newDate}`);
            console.log(roomsAvailability[newDate])
            if (roomsAvailability[newDate] === undefined) {
                setError(`No availability entry found for ${newDate}.`);
                return; 
            }
            console.log("LLLLLLLLLL");
            console.log(roomsAvailability[newDate]);
            console.log(oldNumberOfRooms);
            console.log(numberOfRooms);
            console.log("hhhhhhhhhhhhhh");

            if (roomsAvailability[newDate]+oldNumberOfRooms < numberOfRooms) {
                setError(`Not enough rooms available on ${newDate}. Available: ${roomsAvailability[newDate]}`);
                return; 
            }
        }

        for (let i = 0; i < numberOfNights; i++) {
            const newDate = getDateStringByOffset(startingDate, i);
            roomsAvailability[newDate] -= numberOfRooms; 
        }

        console.log("kkkkkkkkkkkkkkkkkkk");
        console.log(roomsAvailability);
        console.log(oldNumberOfNights);
        console.log(oldNumberOfRooms);
        console.log("ggggggggggggg")

        for (let i = 0; i < oldNumberOfNights; i++) {
            const oldDate = getDateStringByOffset(oldStartingDate, i);
            roomsAvailability[oldDate] += oldNumberOfRooms; 
        }


        console.log("asfffa");
        console.log(startingDate,numberOfNights);
        await updateDoc(bookingRef, {
            numberOfRooms,
            date: startingDate,   
            nights: numberOfNights, 
            place,
        });

        await updateDoc(placeDocRef, {
            availableRooms: roomsAvailability,
        });

        router.push("/checkBookings");
    } catch (error) {
        console.error("Error updating booking:", error);
        setError("An unexpected error occurred while updating the booking."); 
    }
};

  const getDateStringByOffset = (startingDate: string, offset: number) => {
   
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const [day, month, year] = startingDate.split(" ");
    const dayNum = parseInt(day, 10);
    const monthIndex = monthNames.indexOf(month);
    const yearNum = parseInt(year, 10);
  
    const dateObj = new Date(yearNum, monthIndex, dayNum);
    dateObj.setDate(dateObj.getDate() + offset); 
  
    const newDay = dateObj.getDate();
    const newMonth = monthNames[dateObj.getMonth()];
    const newYear = dateObj.getFullYear();
  
    return `${newDay} ${newMonth} ${newYear}`;
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>; 
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Edit Booking</h2>

      {error && <div className="alert alert-danger" role="alert">{error}</div>} 

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="numberOfRooms" className="form-label">Number of Rooms:</label>
          <input
            type="number"
            className="form-control"
            id="numberOfRooms"
            value={numberOfRooms}
            onChange={(e) => setNumberOfRooms(Number(e.target.value))}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="startingDate" className="form-label">Starting Date:</label>
          <select
            className="form-select"
            id="startingDate"
            value={startingDate}
            onChange={(e) => setStartingDate(e.target.value)}
            required
          >
            <option value="">Select a date</option>
            <option value="1 August 2024">1 August 2024</option>
            <option value="2 August 2024">2 August 2024</option>
            <option value="3 August 2024">3 August 2024</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="numberOfNights" className="form-label">Number of Nights:</label>
          <input
            type="number"
            className="form-control"
            id="numberOfNights"
            value={numberOfNights}
            onChange={(e) => setNumberOfNights(Number(e.target.value))}
            required
          />
        </div>

        <div className="mb-3">
        <label htmlFor="place" className="form-label">Place:</label>
<input
  type="text"
  className="form-control"
  id="place"
  value={place}
  onChange={(e) => setPlace(e.target.value)} 
  required
  readOnly
/>
        </div>

        <input
          type="hidden"
          id="bookingPlaceId"
          value={bookingPlaceId}
        />

        <button type="submit" className="btn btn-primary">Update Booking</button>
      </form>
    </div>
  );
};

export default EditBooking;
