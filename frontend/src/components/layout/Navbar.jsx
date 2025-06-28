import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const navLinkClasses = ({ isActive }) => 
    `px-3 py-2 rounded-md ${isActive 
      ? 'bg-primary-dark text-white' 
      : 'text-gray-700 hover:bg-primary-light hover:text-white'}`

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">CARPOOL</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink to="/" end className={navLinkClasses}>
              Dashboard
            </NavLink>
            <NavLink to="/rides" className={navLinkClasses}>
              Find Rides
            </NavLink>
            <NavLink to="/post" className={navLinkClasses}>
              Offer Ride
            </NavLink>
            <NavLink to="/profile" className={navLinkClasses}>
              Profile
            </NavLink>
            
            {/* User menu */}
            <div className="ml-4 flex items-center">
              <div className="flex items-center border-l pl-4 border-gray-300">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <span className="ml-2 text-gray-700">{user?.name || user?.email}</span>
                    <button 
                      onClick={handleLogout}
                      className="ml-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
            >
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink
            to="/"
            end
            className={({isActive}) => 
              `block px-3 py-2 rounded-md ${isActive 
                ? 'bg-primary-dark text-white' 
                : 'text-gray-700 hover:bg-primary-light hover:text-white'}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/rides"
            className={({isActive}) => 
              `block px-3 py-2 rounded-md ${isActive 
                ? 'bg-primary-dark text-white' 
                : 'text-gray-700 hover:bg-primary-light hover:text-white'}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Rides
          </NavLink>
          <NavLink
            to="/post"
            className={({isActive}) => 
              `block px-3 py-2 rounded-md ${isActive 
                ? 'bg-primary-dark text-white' 
                : 'text-gray-700 hover:bg-primary-light hover:text-white'}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Offer Ride
          </NavLink>
          <NavLink
            to="/profile"
            className={({isActive}) => 
              `block px-3 py-2 rounded-md ${isActive 
                ? 'bg-primary-dark text-white' 
                : 'text-gray-700 hover:bg-primary-light hover:text-white'}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </NavLink>
          <button
            onClick={() => {
              handleLogout()
              setMobileMenuOpen(false)
            }}
            className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
