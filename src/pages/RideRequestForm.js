import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  useToast,
  VStack,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion";

const LOCATIONIQ_API_KEY = "pk.02a082d9834c35563c931be2cf773633";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionList = motion(List);

const LocationInput = ({ label, value, setValue, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = async (e) => {
    const input = e.target.value;
    setValue(input);

    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get("https://api.locationiq.com/v1/autocomplete", {
        params: {
          key: LOCATIONIQ_API_KEY,
          q: input,
          format: "json",
          limit: 5,
        },
      });

      setSuggestions(res.data);
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  };

  const handleSelect = (place) => {
    setValue(place.display_name);
    onSelect({
      name: place.display_name,
      lat: place.lat,
      lon: place.lon,
    });
    setSuggestions([]);
  };

  return (
    <FormControl isRequired>
      <FormLabel>{label}</FormLabel>
      <Box position="relative">
        <Input
          value={value}
          onChange={handleChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete="off"
        />

        {suggestions.length > 0 && (
          <MotionList
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            bg="white"
            border="1px solid #ccc"
            position="absolute"
            width="100%"
            zIndex="10"
            mt={1}
            borderRadius="md"
            shadow="md"
            maxH="200px"
            overflowY="auto"
          >
            {suggestions.map((place) => (
              <ListItem
                key={place.place_id}
                p={2}
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleSelect(place)}
              >
                {place.display_name}
              </ListItem>
            ))}
          </MotionList>
        )}
      </Box>
    </FormControl>
  );
};

const RideRequestForm = () => {
  const { user } = useUser();

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [estimatedFare, setEstimatedFare] = useState(null);

  const toast = useToast();

  const calculateFare = async () => {
    if (!pickupCoords || !dropoffCoords) return null;

    try {
      const routeRes = await axios.get(
        `https://us1.locationiq.com/v1/directions/driving/${pickupCoords.lon},${pickupCoords.lat};${dropoffCoords.lon},${dropoffCoords.lat}`,
        {
          params: {
            key: LOCATIONIQ_API_KEY,
            overview: false,
          },
        }
      );

      const route = routeRes.data.routes?.[0];

      if (!route) return null;

      const distanceMeters = route.distance || 0;
      const durationSeconds = route.duration || 0;

      const distanceKm = Number((distanceMeters / 1000).toFixed(1));
      const durationMin = Math.ceil(durationSeconds / 60);

      const fare = Math.round(distanceKm * 10);

      return {
        distanceKm,
        durationMin,
        fare,
      };
    } catch (error) {
      console.error("Route calculation error:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please login first.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!pickupCoords || !dropoffCoords) {
      toast({
        title: "Location missing",
        description: "Please select pickup and dropoff from suggestions.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const tripData = await calculateFare();

      if (!tripData) {
        toast({
          title: "Route error",
          description: "Could not calculate route.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      await addDoc(collection(db, "rideRequests"), {
        pickupLocation,
        dropoffLocation,
        pickupCoords,
        dropoffCoords,
        date,
        time,
        riderId: user.uid,

        distance: tripData.distanceKm,
        duration: tripData.durationMin,
        fare: tripData.fare,

        paymentMode: "cash",
        paymentStatus: "pending",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Ride requested!",
        description: `Estimated fare: ₹${tripData.fare}`,
        status: "success",
        duration: 4000,
      });

      setPickupLocation("");
      setDropoffLocation("");
      setPickupCoords(null);
      setDropoffCoords(null);
      setDate("");
      setTime("");
      setEstimatedFare(null);
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to request ride.",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <MotionBox
      maxW="md"
      mx="auto"
      mt={10}
      p={6}
      borderWidth="1px"
      borderRadius="md"
      boxShadow="lg"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Heading mb={6} textAlign="center">
        Request a Ride
      </Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <LocationInput
            label="Pickup Location"
            value={pickupLocation}
            setValue={setPickupLocation}
            onSelect={setPickupCoords}
          />

          <LocationInput
            label="Dropoff Location"
            value={dropoffLocation}
            setValue={setDropoffLocation}
            onSelect={setDropoffCoords}
          />

          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Time</FormLabel>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </FormControl>
            {pickupCoords && dropoffCoords && (
  <Button
  type="button"
  width="full"
  colorScheme="teal"
    variant="outline"
    onClick={async () => {
      const tripData = await calculateFare();
      if (tripData) {
        setEstimatedFare(tripData);
      }
    }}
  >
    Calculate Fare
  </Button>
)}

{estimatedFare && (
  <Box
    width="full"
    p={4}
    bg="teal.50"
    borderRadius="md"
    border="1px solid"
    borderColor="teal.200"
  >
    <Text fontWeight="bold">
      Distance: {estimatedFare.distanceKm} KM
    </Text>

    <Text>
      Estimated Time: {estimatedFare.durationMin} mins
    </Text>

    <Text
      fontSize="lg"
      color="green.600"
      fontWeight="bold"
    >
      Fare: ₹{estimatedFare.fare}
    </Text>
  </Box>
)}
          <MotionButton
  type="submit"
  colorScheme="teal"
            width="full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Request
          </MotionButton>
        </VStack>
      </form>
    </MotionBox>
  );
};

export default RideRequestForm;