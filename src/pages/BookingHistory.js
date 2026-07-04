import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Badge,
  Button,
  HStack,
  Input,
} from "@chakra-ui/react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

const BookingHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const driverId = auth.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rideRequests"), (snapshot) => {
      const allRides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const historyRides = allRides.filter(
        (ride) =>
          ride.driverId === driverId &&
          ["completed", "cancelled", "rejected"].includes(ride.status)
      );

      setRides(historyRides);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [driverId]);

  const filteredRides = rides.filter((ride) =>
    `${ride.pickupLocation || ""} ${ride.dropoffLocation || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      case "rejected":
        return "orange";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Ride History</Heading>

      <Input
        placeholder="Search ride history..."
        mb={6}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredRides.length === 0 ? (
        <Text>No ride history found.</Text>
      ) : (
        <VStack spacing={5} align="stretch">
          {filteredRides.map((ride) => (
            <Box
              key={ride.id}
              borderWidth="1px"
              borderRadius="lg"
              p={5}
              boxShadow="sm"
            >
              <HStack justify="space-between" mb={3}>
                <Heading size="sm">
                  {ride.pickupLocation} → {ride.dropoffLocation}
                </Heading>

                <Badge colorScheme={getStatusColor(ride.status)}>
                  {ride.status.toUpperCase()}
                </Badge>
              </HStack>

              <Text><strong>Date:</strong> {ride.date || "-"}</Text>
              <Text><strong>Time:</strong> {ride.time || "-"}</Text>
              <Text><strong>Distance:</strong> {ride.distance || 0} km</Text>
              <Text><strong>Duration:</strong> {ride.duration || 0} mins</Text>
              <Text><strong>Fare:</strong> ₹{ride.fare || 50}</Text>

              {ride.paymentStatus && (
                <Text>
                  <strong>Payment:</strong> {ride.paymentStatus}
                </Text>
              )}

              {ride.driverReview && (
                <Text>
                  <strong>Your Review:</strong> {ride.driverReview}
                </Text>
              )}

              {ride.driverRating && (
                <Text>
                  <strong>Rating:</strong> ⭐ {ride.driverRating}/5
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default BookingHistory;