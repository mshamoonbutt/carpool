import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">CARPOOL</h2>
            <p className="text-sm text-gray-300">University Ride Sharing Platform</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold mb-2">Quick Links</h3>
              <ul className="text-sm text-gray-300">
                <li className="mb-1">
                  <a href="/rides" className="hover:text-primary">Find Rides</a>
                </li>
                <li className="mb-1">
                  <a href="/post" className="hover:text-primary">Offer a Ride</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <ul className="text-sm text-gray-300">
                <li className="mb-1">
                  <a href="mailto:support@carpool-uni.com" className="hover:text-primary">support@carpool-uni.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} CARPOOL. All rights reserved.</p>
          <p>Made with ❤️ for university students</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
