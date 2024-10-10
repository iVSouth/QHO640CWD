"use client"; 

import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig'; 
import { signOut, User } from 'firebase/auth';

export default function Home() {
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

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push('/login'); 
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  const handleFindRedirect = () => {
    router.push('/find');
  };

  return (
    <div className="container text-center my-5">
      <section className="my-5">
        <h1 className="display-4 mb-4">Welcome to Booking Website</h1>
        <p className="lead">
          Our platform makes it easy for you to book your next stay. Whether you're looking for
          a cozy hotel, an affordable apartment, or a luxurious vacation rental, we have it all.
          Enjoy seamless and hassle-free booking with us!
        </p>
      </section>

      <section className="row my-5">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Wide Range of Options</h5>
              <p className="card-text">
                Choose from thousands of accommodations worldwide, including hotels, apartments,
                vacation rentals, and more.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Easy Booking Process</h5>
              <p className="card-text">
                We make booking easy with a user-friendly interface and quick confirmation, giving
                you peace of mind for your stay.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Affordable Rates</h5>
              <p className="card-text">
                Enjoy competitive pricing and exclusive deals on accommodations without breaking
                the bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="my-5">
        <h2 className="mb-4">Find Your Perfect Stay</h2>
        <p className="lead mb-4">
          Looking for a place to stay? Use our powerful search tool to find accommodations that
          fit your preferences and budget.
        </p>
        <button
          className="btn btn-primary btn-lg mb-3"
          onClick={handleFindRedirect}
        >
          Start Searching
        </button>
      </section>

      {user && (
        <section className="my-5">
          <button
            className="btn btn-danger btn-lg"
            onClick={handleLogout}
          >
            Logout
          </button>
        </section>
      )}

      <section className="my-5">
        <h3 className="mb-4">Why Book With Us?</h3>
        <p className="lead">
          Our platform is designed with your convenience in mind. We partner with the best
          accommodations worldwide to provide you with a wide selection of stays at affordable
          rates. With our secure and easy-to-use booking system, you'll find the perfect place
          for your next trip.
        </p>
        <p>
          Whether you're planning a business trip, family vacation, or weekend getaway, we have
          something for everyone. Explore a world of possibilities and start planning your
          next adventure today!
        </p>
      </section>
    </div>
  );
}
