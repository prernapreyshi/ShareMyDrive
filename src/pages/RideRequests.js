import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
  useToast,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

// Motion-enhanced components
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const RideRequests = () => {
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const q = query(
      collection(db, "rideRequests"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRideRequests(rides);
        setLoading(false);
      },
      (error) => {
        toast({
          title: "Failed to fetch ride requests",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleAccept = async (rideId) => {
    try {
      const rideRef = doc(db, "rideRequests", rideId);
      const rideSnap = await getDoc(rideRef);

      if (!rideSnap.exists()) {
        toast({
          title: "Ride not found",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const rideData = rideSnap.data();
      if (rideData.status !== "pending") {
        toast({
          title: "Ride already accepted or unavailable",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      await updateDoc(rideRef, {
        status: "accepted",
        driverId: auth.currentUser.uid,
      });

      toast({
        title: "Ride accepted!",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error accepting ride",
        description: err.message,
        status: "error",
        duration: 3000,
      });
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
    <Box maxW="4xl" mx="auto" mt={10}>
      <Heading mb={6} textAlign="center">
        Available Ride Requests
      </Heading>

      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="show"
        as={VStack}
        spacing={4}
        align="stretch"
      >
        <AnimatePresence>
          {rideRequests.length === 0 ? (
            <Text textAlign="center">No ride requests available.</Text>
          ) : (
            rideRequests.map((ride) => (
              <MotionBox
                key={ride.id}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
                p={4}
                borderWidth={1}
                borderRadius="lg"
                boxShadow="md"
                bg="white"
              >
                <Stack spacing={2}>
                  <Text>
                    <strong>Pickup:</strong> {ride.pickupLocation}
                  </Text>
                  <Text>
                    <strong>Dropoff:</strong> {ride.dropoffLocation}
                  </Text>
                  <Text>
                    <strong>Date:</strong> {ride.date}
                  </Text>
                  <Text>
                    <strong>Time:</strong> {ride.time}
                  </Text>
                  {ride.riderName && (
                    <Text>
                      <strong>Requested by:</strong> {ride.riderName}
                    </Text>
                  )}
                  {ride.riderEmail && (
                    <Text>
                      <strong>Email:</strong> {ride.riderEmail}
                    </Text>
                  )}
                  <Divider />
                  <MotionButton
                    mt={2}
                    colorScheme="green"
                    onClick={() => handleAccept(ride.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Accept Ride
                  </MotionButton>
                </Stack>
              </MotionBox>
            ))
          )}
        </AnimatePresence>
      </MotionBox>
    </Box>
  );
};

export default RideRequests;
