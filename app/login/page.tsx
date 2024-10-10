"use client";  
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        const userData = userDoc.data();
        if (userData?.category === 'admin') {
          router.push('/AdminDashboard');
        } else {
          router.push('/home');
        }
      }
    });
    return () => unsubscribe();
  }, [router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      
      if (error instanceof Error) {
       
        const errorCode = (error as any).code;
  
        if (errorCode === 'auth/wrong-password') {
          setError('Invalid password. Please try again.');
        } else if (errorCode === 'auth/user-not-found') {
          setError('No user found with this email address.');
        } else if (errorCode === 'auth/invalid-email') {
          setError('Invalid email format.');
        } else {
          setError('No User Found.');
        }
        console.error('Error Logging in: ', error);
      } else {
        setError('An unexpected error occurred. Please try again later.');
        console.error('Unexpected error:', error);
      }
    }
  };
  

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          
          <div className="card">
            <div className="card-body">
              <h3 className="text-center mb-4">Login</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                  />
                </div>
                <div className="d-grid">
                <button type="submit" className="btn btn-primary">Login</button>

                </div>
              </form>
              <p className="mt-3 text-center">
                Don't have an account? <a href="/singup">Sign up here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
