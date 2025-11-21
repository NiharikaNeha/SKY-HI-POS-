import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../firebase";
import {
  FaHome,
  FaUtensils,
  FaHistory,
  FaCrown,
  FaLeaf,
  FaDrumstickBite,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [foodFilter, setFoodFilter] = useState("All"); // "All", "Veg", "Non-Veg"
  const [orderType, setOrderType] = useState("dining"); // "dining" or "parcel"
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const isLoginPage = location.pathname === "/login";
  
  useEffect(() => {
    // Fetch user from backend if signed in
    const fetchUser = async () => {
      if (user && !loading) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      } else {
        setUserData(null);
      }
    };
    fetchUser();
  }, [user, loading, location.pathname]);

  // Store orderType in localStorage and pass to Dashboard via context or URL
  useEffect(() => {
    if (orderType) {
      localStorage.setItem('orderType', orderType);
      // Dispatch custom event so Dashboard can listen
      window.dispatchEvent(new CustomEvent('orderTypeChanged', { detail: orderType }));
    }
  }, [orderType]);

  // Load orderType from localStorage on mount
  useEffect(() => {
    const savedOrderType = localStorage.getItem('orderType');
    if (savedOrderType) {
      setOrderType(savedOrderType);
    }
  }, []);

  const handleLogout = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
    navigate("/", { replace: true });
  };

  const toggleFilter = () => {
    setFoodFilter(prev => {
      const newFilter = prev === "All" ? "Veg" : prev === "Veg" ? "Non-Veg" : "All";
      localStorage.setItem('foodFilter', newFilter);
      // Dispatch event so Menu component can listen
      window.dispatchEvent(new CustomEvent('foodFilterChanged', { detail: newFilter }));
      return newFilter;
    });
  };

  // Load foodFilter from localStorage on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem('foodFilter');
    if (savedFilter) {
      setFoodFilter(savedFilter);
    }
  }, []);

  const toggleOrderType = () => {
    setOrderType(prev => prev === "dining" ? "parcel" : "dining");
  };

  const isAdmin = userData?.role === "admin" || false;

  return (
    <>
      {/* Top Header - Elegant & Professional Design */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-orange-50 via-white to-orange-50 shadow-lg border-b-2 border-orange-200 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo and Branding */}
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-orange-200 ring-2 ring-orange-300">
                  🍽️
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
              </motion.div>
              
              <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent tracking-tight cursor-pointer">
                  Food Fantasy
                </h1>
                {user && !isLoginPage && (
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Welcome, <span className="text-orange-600 font-semibold">{userData?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
                  </p>
                )}
              </Link>

              {/* Profile Avatar - Elegant Design */}
              {user && !isLoginPage && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard/profile')}
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm sm:text-base flex items-center justify-center hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 border-2 border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 overflow-hidden ml-2 group"
                  title={userData?.name || user?.displayName || user?.email || 'User'}
                >
                  {userData?.profileImage ? (
                    <img 
                      src={userData.profileImage} 
                      alt={userData?.name || user?.displayName || user?.email || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="relative z-10">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : (user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>
              )}
            </div>

            {/* Center: Toggle Switches - Compact Design */}
            {!isLoginPage && user && (
              <div className="hidden md:flex items-center gap-4">
                {/* Order Type Toggle - Dining/Parcel */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">Order Type</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleOrderType}
                    className={`relative w-16 h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md ${
                      orderType === "dining"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 focus:ring-orange-500"
                        : "bg-gradient-to-r from-gray-400 to-gray-500 focus:ring-gray-400"
                    }`}
                    title={orderType === "dining" ? "Dining In" : "Takeaway"}
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-xs"
                      animate={{
                        x: orderType === "dining" ? 2 : 42,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {orderType === "dining" ? "🍽️" : "📦"}
                    </motion.div>
                  </motion.button>
                </div>

                {/* Food Filter Toggle - Veg/Non-Veg */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">Filter</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFilter}
                    className={`relative w-16 h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md ${
                      foodFilter === "Veg"
                        ? "bg-gradient-to-r from-green-500 to-green-600 focus:ring-green-500"
                        : foodFilter === "Non-Veg"
                        ? "bg-gradient-to-r from-red-500 to-red-600 focus:ring-red-500"
                        : "bg-gradient-to-r from-gray-400 to-gray-500 focus:ring-gray-400"
                    }`}
                    title={`Filter: ${foodFilter === "Veg" ? "Veg Only" : foodFilter === "Non-Veg" ? "Non-Veg Only" : "All Items"}`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                      animate={{
                        x: foodFilter === "Veg" ? 2 : foodFilter === "Non-Veg" ? 42 : 22,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {foodFilter === "Veg" ? (
                        <FaLeaf className="text-green-600 text-xs" />
                      ) : foodFilter === "Non-Veg" ? (
                        <FaDrumstickBite className="text-red-600 text-xs" />
                      ) : (
                        <div className="flex gap-0.5">
                          <FaLeaf className="text-gray-500 text-[8px]" />
                          <FaDrumstickBite className="text-gray-500 text-[8px]" />
                        </div>
                      )}
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Right: Navigation Buttons - Compact & Elegant */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Home Button - Always visible */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center gap-1.5 ${
                  location.pathname === '/' || location.pathname === '/home'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                    : 'bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400'
                }`}
              >
                <FaHome className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Home</span>
              </motion.button>

              {/* Menu Button */}
              {user && !isLoginPage && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
                    location.pathname === '/dashboard' || location.pathname === '/dashboard/'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                      : 'bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400'
                  }`}
                >
                  <span className="hidden sm:inline">Menu</span>
                  <FaUtensils className="sm:hidden" />
                </motion.button>
              )}

              {/* Orders Button */}
              {user && !isLoginPage && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard/orders')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
                    location.pathname === '/dashboard/orders'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                      : 'bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400'
                  }`}
                >
                  <span className="hidden sm:inline">Orders</span>
                  <FaHistory className="sm:hidden" />
                </motion.button>
              )}

              {/* Admin Button */}
              {isAdmin && !isLoginPage && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm text-orange-600 bg-white border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 shadow-sm"
                  >
                    <FaCrown className="text-sm" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </motion.div>
              )}

              {/* Profile Dropdown / Login Button */}
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center gap-1.5 ${
                      location.pathname === '/dashboard/profile'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                        : 'bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400'
                    }`}
                  >
                    <FaUserCircle className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Profile</span>
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowProfileDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border-2 border-orange-200 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate('/dashboard/profile');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 transition-colors flex items-center gap-2"
                          >
                            <FaUserCircle className="text-orange-600 text-xs" />
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <FaSignOutAlt className="text-xs" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  as={Link}
                  to="/login"
                  className="px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200"
                >
                  Login
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar - Mobile/Tablet - Elegant Design */}
      {!isLoginPage && user && (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t-2 border-orange-200 shadow-2xl md:hidden backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-2">
            <div className="flex items-center justify-around h-16">
              {/* Order Type Toggle */}
              <div className="flex flex-col items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleOrderType}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md ${
                    orderType === "dining"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 focus:ring-orange-500"
                      : "bg-gradient-to-r from-gray-400 to-gray-500 focus:ring-gray-400"
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-xs"
                    animate={{
                      x: orderType === "dining" ? 2 : 30,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {orderType === "dining" ? "🍽️" : "📦"}
                  </motion.div>
                </motion.button>
                <span className="text-[10px] text-gray-500 font-medium">Order</span>
              </div>

              {/* Food Filter Toggle */}
              <div className="flex flex-col items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFilter}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md ${
                    foodFilter === "Veg"
                      ? "bg-gradient-to-r from-green-500 to-green-600 focus:ring-green-500"
                      : foodFilter === "Non-Veg"
                      ? "bg-gradient-to-r from-red-500 to-red-600 focus:ring-red-500"
                      : "bg-gradient-to-r from-gray-400 to-gray-500 focus:ring-gray-400"
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                    animate={{
                      x: foodFilter === "Veg" ? 2 : foodFilter === "Non-Veg" ? 30 : 16,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {foodFilter === "Veg" ? (
                      <FaLeaf className="text-green-600 text-xs" />
                    ) : foodFilter === "Non-Veg" ? (
                      <FaDrumstickBite className="text-red-600 text-xs" />
                    ) : (
                      <div className="flex gap-0.5">
                        <FaLeaf className="text-gray-500 text-[8px]" />
                        <FaDrumstickBite className="text-gray-500 text-[8px]" />
                      </div>
                    )}
                  </motion.div>
                </motion.button>
                <span className="text-[10px] text-gray-500 font-medium">Filter</span>
              </div>

              {/* Home */}
              <Link
                to="/"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  location.pathname === "/"
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <FaHome className="text-lg" />
                <span className="text-[10px] font-medium">Home</span>
              </Link>

              {/* Menu */}
              <Link
                to="/dashboard"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  location.pathname === "/dashboard" || location.pathname === "/dashboard/"
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <FaUtensils className="text-lg" />
                <span className="text-[10px] font-medium">Menu</span>
              </Link>

              {/* Orders */}
              <Link
                to="/dashboard/orders"
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  location.pathname === "/dashboard/orders"
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <FaHistory className="text-lg" />
                <span className="text-[10px] font-medium">Orders</span>
              </Link>

              {/* Profile */}
              <div className="relative">
                <Link
                  to="/dashboard/profile"
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-all ${
                    location.pathname === "/dashboard/profile"
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-500"
                  }`}
                >
                  <FaUserCircle className="text-lg" />
                  <span className="text-[10px] font-medium">Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
      {!isLoginPage && user && <div className="h-16 md:hidden"></div>}
    </>
  );
};

// Export foodFilter and orderType for use in other components
export const useNavbarState = () => {
  const [foodFilter, setFoodFilter] = useState(() => {
    return localStorage.getItem('foodFilter') || 'All';
  });
  const [orderType, setOrderType] = useState(() => {
    return localStorage.getItem('orderType') || 'dining';
  });

  useEffect(() => {
    const handleOrderTypeChange = (e) => {
      setOrderType(e.detail);
    };
    window.addEventListener('orderTypeChanged', handleOrderTypeChange);
    return () => window.removeEventListener('orderTypeChanged', handleOrderTypeChange);
  }, []);

  return { foodFilter, orderType };
};

export default Navbar;
