import React from "react";
import { ChakraProvider, Text } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import theme from "./styles/theme";
import { UserProvider, useUser } from "./context/UserContext";

// Components
import AppNavbar from "./Components/AppNavbar";
import HomeNavbar from "./Components/HomeNavbar";
import ShowMyRidePage from "./Components/ShowMyRidePage";
import DashboardLayout from "./Components/DashboardLayout";
import ContactForm from "./Components/ContactForm";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SelectRole from "./pages/SelectRole";
import DriverDashboard from "./pages/DriverDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import SearchResults from "./pages/SearchResults";
import BookingConfirmation from "./pages/BookingConfirmation";
import RiderDetails from "./pages/RiderDetails";
import DriverDetails from "./pages/DriverDetails";
import BookingHistory from "./pages/BookingHistory";
import EditProfile from "./pages/EditProfile";
import RideDetails from "./pages/RideDetails";
import RideRequestForm from "./pages/RideRequestForm";
import AvailableRideRequests from "./pages/AvailableRideRequests";
import Settings from "./pages/Settings";

const NotFound = () => (
  <Text fontSize="2xl" textAlign="center" mt={20} color="gray.500">
    404 - Page Not Found
  </Text>
);

// Pages that live inside the dashboard sidebar layout
const DASHBOARD_ROUTES = [
  "/driver-dashboard",
  "/rider-dashboard",
  "/available-rides",
  "/booking-history",
  "/edit-profile",
  "/settings",
  "/request-ride",
];

function AppLayout() {
  const location = useLocation();
  const { user, role } = useUser();

  const path = location.pathname;
  const isDashboardRoute = DASHBOARD_ROUTES.some((r) => path.startsWith(r));
  const showHomeNavbar = path === "/" || path === "/home";
  const showNavbar = !isDashboardRoute;

  const NavbarComponent = showHomeNavbar ? HomeNavbar : AppNavbar;

  // Determine userType for DashboardLayout based on role from context
  const userType = role === "rider" ? "rider" : "driver";

  const withDashboard = (Component, type) => (
    <DashboardLayout userInfo={user} userType={type || userType}>
      <Component />
    </DashboardLayout>
  );

  return (
    <>
      {showNavbar && <NavbarComponent />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/show-my-ride" element={<ShowMyRidePage />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/ride-details/:rideId" element={<RideDetails />} />
        <Route path="/booking-confirmation/:rideId" element={<BookingConfirmation />} />
        <Route path="/contact" element={<ContactForm />} />

        {/* Rider setup (no sidebar needed) */}
        <Route path="/rider-details" element={<RiderDetails />} />

        {/* Driver setup (no sidebar needed) */}
        <Route path="/driver-details" element={<DriverDetails />} />

        {/* ── Rider Dashboard pages ── */}
        <Route
          path="/rider-dashboard"
          element={withDashboard(RiderDashboard, "rider")}
        />
        <Route
          path="/request-ride"
          element={withDashboard(RideRequestForm, "rider")}
        />

        {/* ── Driver Dashboard pages ── */}
        <Route
          path="/driver-dashboard"
          element={withDashboard(DriverDashboard, "driver")}
        />
        <Route
          path="/available-rides"
          element={withDashboard(AvailableRideRequests, "driver")}
        />

        {/* ── Shared dashboard pages (role auto-detected) ── */}
        <Route
          path="/booking-history"
          element={
            <DashboardLayout userInfo={user} userType={userType}>
              <BookingHistory />
            </DashboardLayout>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <DashboardLayout userInfo={user} userType={userType}>
              <EditProfile />
            </DashboardLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardLayout userInfo={user} userType={userType}>
              <Settings />
            </DashboardLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <UserProvider>
          <AppLayout />
        </UserProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
