import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  useToast,
  Badge,
  Button,
  Center,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useUser } from "../context/UserContext";
import RideCard from "../Components/RideCard";
import { StarIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";

// Framer Motion Components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const RiderDashboard = () => {
  const { user } = useUser();
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const previousStatusesRef = useRef({});

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "rideRequests"),
      where("riderId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        requests.forEach((ride) => {
          const previousStatus = previousStatusesRef.current[ride.id];
          const newStatus = ride.status;

          if (
            previousStatus &&
            previousStatus !== newStatus &&
            ["accepted", "completed", "cancelled", "rejected"].includes(newStatus)
          ) {
            toast({
              title: `Ride ${capitalize(newStatus)}`,
              description: `Your ride from ${ride.pickupLocation} to ${ride.dropoffLocation} was ${newStatus}.`,
              status: getStatusToastColor(newStatus),
              duration: 5000,
              isClosable: true,
            });
          }

          previousStatusesRef.current[ride.id] = newStatus;
        });

        setRideRequests(requests);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching ride requests:", error);
        toast({
          title: "Error loading ride requests.",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const handleRateAndPay = async (rideId, rating) => {
    try {
      const rideRef = doc(db, "rideRequests", rideId);
      await updateDoc(rideRef, {
        rating,
        paymentStatus: "paid",
      });

      toast({
        title: "Thank you!",
        description: "Rating submitted and payment marked as done.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error updating rating/payment:", err);
      toast({
        title: "Error",
        description: "Could not submit rating or payment.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      px={4}
      py={6}
    >
      <Heading mb={4}>My Ride Requests</Heading>

      <Button
        colorScheme="purple"
        mb={6}
        onClick={() => navigate("/request-ride")}
        _hover={{ transform: "scale(1.05)" }}
        transition="all 0.3s ease"
      >
        Request a Ride
      </Button>

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
        </Center>
      ) : rideRequests.length === 0 ? (
        <Text>No ride requests found.</Text>
      ) : (
        <MotionVStack
          spacing={5}
          align="stretch"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <AnimatePresence>
            {rideRequests.map((ride) => (
              <MotionBox
                key={ride.id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                boxShadow="sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <RideCard ride={ride} isRiderView />
                <Box mt={2}>
                  <Badge colorScheme={getStatusColor(ride.status)}>
                    {ride.status?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    Requested:{" "}
                    {ride.createdAt?.toDate
                      ? ride.createdAt.toDate().toLocaleString()
                      : "N/A"}
                  </Text>
                </Box>

                {ride.status === "completed" && ride.paymentStatus !== "paid" && (
                  <Box mt={4}>
                    <Text fontWeight="bold">Rate Your Driver:</Text>
                    <HStack spacing={1} my={2}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.div
                          whileTap={{ scale: 0.8 }}
                          key={star}
                          style={{ display: "inline-block" }}
                        >
                          <StarIcon
                            color={
                              ride.rating && ride.rating >= star
                                ? "yellow.400"
                                : "gray.300"
                            }
                            boxSize={6}
                            cursor="pointer"
                            onClick={() => handleRateAndPay(ride.id, star)}
                          />
                        </motion.div>
                      ))}
                    </HStack>
                    <Button
                      colorScheme="purple"
                      onClick={() => handleRateAndPay(ride.id, ride.rating || 5)}
                    >
                      Mark as Paid
                    </Button>
                  </Box>
                )}

                {ride.paymentStatus === "paid" && (
                  <Text mt={3} color="green.500" fontWeight="semibold">
                    ✅ Payment completed & driver rated.
                  </Text>
                )}
              </MotionBox>
            ))}
          </AnimatePresence>
        </MotionVStack>
      )}
    </MotionBox>
  );
};

// Helpers
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "accepted":
      return "blue";
    case "completed":
      return "green";
    case "cancelled":
    case "rejected":
      return "red";
    default:
      return "gray";
  }
};

const getStatusToastColor = (status) => {
  switch (status) {
    case "accepted":
      return "info";
    case "completed":
      return "success";
    case "cancelled":
    case "rejected":
      return "warning";
    default:
      return "info";
  }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default RiderDashboard;
