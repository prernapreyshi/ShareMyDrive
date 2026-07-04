// src/Pages/RideDetails.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Badge,
  VStack,
  Center,
  Divider,
  Image,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import DashboardLayout from "../Components/DashboardLayout";
import { useUser } from "../context/UserContext";

const LOCATIONIQ_API_KEY = "pk.02a082d9834c35563c931be2cf773633";

const RideDetails = () => {
  const { rideId } = useParams();
  const { role } = useUser();
  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const docRef = doc(db, "rideRequests", rideId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const rideData = { id: docSnap.id, ...docSnap.data() };
          setRide(rideData);

          // Fetch driver info if driverId exists
          if (rideData.driverId) {
            const driverRef = doc(db, "drivers", rideData.driverId);
            const driverSnap = await getDoc(driverRef);
            if (driverSnap.exists()) {
              setDriver(driverSnap.data());
            }
          }
        } else {
          console.error("Ride not found");
        }
      } catch (error) {
        console.error("Error fetching ride details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideId]);

  const getStaticMapUrl = () => {
    if (!ride?.pickupCoords || !ride?.dropoffCoords) return null;

    const pickup = `${ride.pickupCoords.lat},${ride.pickupCoords.lon}`;
    const dropoff = `${ride.dropoffCoords.lat},${ride.dropoffCoords.lon}`;

    return `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_API_KEY}&center=${pickup}&zoom=13&size=800x400&markers=icon:small-red-cutout|${pickup}|icon:small-blue-cutout|${dropoff}&path=color:0x673ab7|weight:3|${pickup}|${dropoff}`;
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  if (!ride) {
    return (
      <Center py={10}>
        <Text>Ride not found.</Text>
      </Center>
    );
  }

  return (
    <DashboardLayout userType={role}>
      <Box p={6}>
        <Heading mb={4}>Ride Details</Heading>

        <VStack spacing={4} align="start">
          <Text><strong>Pickup:</strong> {ride.pickupLocation}</Text>
          <Text><strong>Dropoff:</strong> {ride.dropoffLocation}</Text>
          <Text><strong>Date:</strong> {ride.date}</Text>
          <Text><strong>Time:</strong> {ride.time}</Text>
          <Text><strong>Status:</strong>{" "}
            <Badge colorScheme={getStatusColor(ride.status)}>
              {ride.status?.toUpperCase()}
            </Badge>
          </Text>

          {/* Driver Info */}
          {driver && (
            <>
              <Divider />
              <Text fontWeight="bold">Driver Details:</Text>
              <Text><strong>Name:</strong> {driver.name}</Text>
              <Text><strong>Phone:</strong> {driver.phone}</Text>
              <Text><strong>Vehicle:</strong> {driver.vehicleInfo}</Text>
              <Text><strong>License Plate:</strong> {driver.licensePlate}</Text>
            </>
          )}

          {/* Coordinates */}
          {ride.pickupCoords && (
            <Text>
              <strong>Pickup Coords:</strong> {ride.pickupCoords.lat}, {ride.pickupCoords.lon}
            </Text>
          )}
          {ride.dropoffCoords && (
            <Text>
              <strong>Dropoff Coords:</strong> {ride.dropoffCoords.lat}, {ride.dropoffCoords.lon}
            </Text>
          )}

          {/* Static Map Preview */}
          {getStaticMapUrl() && (
            <>
              <Divider />
              <Text fontWeight="bold">Route Preview:</Text>
              <Image
                src={getStaticMapUrl()}
                alt="Route map preview"
                borderRadius="md"
                boxShadow="md"
                maxW="100%"
              />
            </>
          )}

          <Divider />
          <Text fontSize="sm" color="gray.500">
            Request ID: {ride.id}
          </Text>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "accepted":
      return "blue";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
};

export default RideDetails;
