import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

const LOCATIONIQ_API_KEY = "pk.02a082d9834c35563c931be2cf773633";

const BookingConfirmation = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [relatedUser, setRelatedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchRideAndUserRole = async () => {
      try {
        const rideRef = doc(db, "rideRequests", rideId);
        const rideSnap = await getDoc(rideRef);
        if (!rideSnap.exists()) {
          toast({ title: "Ride not found", status: "error", duration: 3000 });
          navigate("/search-results");
          return;
        }

        const rideData = { id: rideSnap.id, ...rideSnap.data() };
        setRide(rideData);

        const userRef = doc(db, "users", currentUserId);
        const userSnap = await getDoc(userRef);
        const role = userSnap.data()?.role;
        setUserRole(role);

        // Determine which user info to fetch
        let relatedId, relatedCollection;
        if (role === "driver") {
          relatedId = rideData.riderId;
          relatedCollection = "riders";
        } else if (role === "rider") {
          relatedId = rideData.driverId;
          relatedCollection = "drivers";
        }

        if (relatedId && relatedCollection) {
          const relatedUserRef = doc(db, relatedCollection, relatedId);
          const relatedUserSnap = await getDoc(relatedUserRef);
          if (relatedUserSnap.exists()) {
            setRelatedUser(relatedUserSnap.data());
          }
        }
      } catch (err) {
        toast({
          title: "Error loading data",
          description: err.message,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRideAndUserRole();
  }, [rideId, navigate, toast, currentUserId]);

  const handleConfirmBooking = async () => {
    try {
      const rideRef = doc(db, "rideRequests", ride.id);
      await updateDoc(rideRef, {
        status: "booked",
        bookedBy: currentUserId,
      });
      toast({ title: "Ride booked!", status: "success", duration: 3000 });
      navigate("/rider-dashboard");
    } catch (err) {
      toast({
        title: "Booking failed",
        description: err.message,
        status: "error",
      });
    }
  };

  const getStaticMapUrl = (pickupCoords, dropoffCoords) => {
    if (!pickupCoords || !dropoffCoords) return null;
    return `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_API_KEY}&center=${pickupCoords.lat},${pickupCoords.lon}&zoom=13&size=600x300&markers=icon:large-red-cutout|${pickupCoords.lat},${pickupCoords.lon}|icon:large-blue-cutout|${dropoffCoords.lat},${dropoffCoords.lon}&path=color:0x6600ff|weight:3|${pickupCoords.lat},${pickupCoords.lon}|${dropoffCoords.lat},${dropoffCoords.lon}`;
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!ride) return null;

  return (
    <Box maxW="3xl" mx="auto" mt={10} p={6}>
      <Heading mb={4} color="brand.400">🚗 Ride Confirmation</Heading>
      <Text><strong>From:</strong> {ride.pickupLocation}</Text>
      <Text><strong>To:</strong> {ride.dropoffLocation}</Text>
      <Text><strong>Date:</strong> {ride.date}</Text>
      <Text><strong>Time:</strong> {ride.time}</Text>

      {ride.pickupCoords && ride.dropoffCoords && (
        <Image
          src={getStaticMapUrl(ride.pickupCoords, ride.dropoffCoords)}
          alt="Map"
          mt={4}
          borderRadius="md"
        />
      )}

      {relatedUser && (
        <Box mt={6} p={4} borderWidth={1} borderRadius="md" boxShadow="md">
          <Heading size="md" mb={2}>
            {userRole === "rider" ? "Driver Info" : "Rider Info"}
          </Heading>
          <Text><strong>Name:</strong> {relatedUser.name}</Text>
          <Text><strong>Phone:</strong> {relatedUser.phone}</Text>
          <Text><strong>Email:</strong> {relatedUser.email}</Text>
          {userRole === "rider" && (
            <>
              <Text><strong>Vehicle:</strong> {relatedUser.vehicleInfo}</Text>
              <Text><strong>License Plate:</strong> {relatedUser.licensePlate}</Text>
            </>
          )}
        </Box>
      )}

      {userRole === "rider" && ride.status === "pending" && (
        <Button
          mt={6}
          colorScheme="purple"
          size="lg"
          onClick={handleConfirmBooking}
        >
          ✅ Confirm Booking
        </Button>
      )}
    </Box>
  );
};

export default BookingConfirmation;
