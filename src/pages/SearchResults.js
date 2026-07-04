import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  VStack,
  Image,
} from "@chakra-ui/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";

const LOCATIONIQ_API_KEY = "pk.02a082d9834c35563c931be2cf773633";

const SearchResults = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableRides = async () => {
      try {
        const q = query(
          collection(db, "rideRequests"),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const fetchedRides = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRides(fetchedRides);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableRides();
  }, []);

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

  return (
    <Box maxW="5xl" mx="auto" mt={10} p={6}>
      <Heading mb={6} color="brand.400">
        🔍 Available Rides
      </Heading>
      {rides.length === 0 ? (
        <Text>No rides available at the moment.</Text>
      ) : (
        <VStack spacing={6} align="stretch">
          {rides.map((ride) => (
            <Box
              key={ride.id}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              boxShadow="md"
            >
              <Text><strong>From:</strong> {ride.pickupLocation}</Text>
              <Text><strong>To:</strong> {ride.dropoffLocation}</Text>
              <Text><strong>Date:</strong> {ride.date}</Text>
              <Text><strong>Time:</strong> {ride.time}</Text>

              {ride.pickupCoords && ride.dropoffCoords && (
                <Image
                  mt={4}
                  src="/src/assets/location.svg" 
                  alt="Ride route preview"
                  borderRadius="md"
                />
              )}

              <Button
                mt={4}
                colorScheme="purple"
                onClick={() => navigate(`/booking-confirmation/${ride.id}`)}
              >
                View Details
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default SearchResults;
