"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('user');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category === 'admin' && adminCode !== 'Iamadmin') {
      setError('Invalid admin code.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        category,
      });

      if (category === 'admin') {
        router.push('/AdminDashboard');
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Error signing up: ', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="text-center mb-4">Sign Up</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSignup}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                    required
                  />
                </div>
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
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Sign Up As</label>
                  <select
                    className="form-control"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {category === 'admin' && (
                  <div className="mb-3">
                    <label htmlFor="adminCode" className="form-label">Admin Code</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="adminCode" 
                      value={adminCode} 
                      onChange={(e) => setAdminCode(e.target.value)} 
                      required
                    />
                  </div>
                )}
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Sign Up</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
