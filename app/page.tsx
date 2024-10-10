"use client";  
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth, db } from './firebaseConfig';

import { doc, getDoc } from 'firebase/firestore'; 

import { useRouter } from 'next/navigation'; 
const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData?.category === 'admin') {
              router.push('/AdminDashboard');


            } else {
              router.push('/home');
            }
          } else {

            console.error('No user data found!');
            auth.signOut();
            router.push('/login');
          }
        } else {
         
          router.push('/login');
        }
      });

      setLoading(false); 
    };

    checkUserSession();
  }, [router]);


  if (loading) {
    return <div>Loading...</div>; 
  }

  return null;
};

export default HomePage;
