"use client"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname(); 

  const hideNavbarRoutes = ['/login', '/signup'];

  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1">
          {!hideNavbarRoutes.includes(pathname) && (
            <header>
              <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                  <Link href="/" className="navbar-brand">
                    Booking Website
                  </Link>
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link href="/" className="nav-link">
                          Home
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link href="/bookings" className="nav-link">
                          Bookings
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link href="/find" className="nav-link">
                          Find
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link href="/history" className="nav-link">
                          History
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </header>
          )}

          <main className="container my-4">
            {children}
          </main>
        </div>

        <footer className="bg-light text-center py-3 mt-auto">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Booking Website. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
};

export default Layout;
