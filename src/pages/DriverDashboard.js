import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Spinner,
  useToast,
  Switch,
  HStack,
  Button,
  Badge,
  Divider,
} from "@chakra-ui/react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();
  const driverId = auth.currentUser?.uid;

  useEffect(() => {
    if (!driverId) return;

    const fetchDriverData = async () => {
      try {
        const driverRef = doc(db, "drivers", driverId);
        const driverSnap = await getDoc(driverRef);

        if (driverSnap.exists()) {
          const data = driverSnap.data();
          setDriverData(data);
          setIsOnline(data.isOnline ?? true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDriverData();

    const unsubscribe = onSnapshot(
      collection(db, "rideRequests"),
      (snapshot) => {
        const allRides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRides(allRides);
        setLoading(false);
      },
      (error) => {
        toast({
          title: "Error loading dashboard",
          description: error.message,
          status: "error",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast, driverId]);

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);

      await updateDoc(doc(db, "drivers", driverId), {
        isOnline: newStatus,
      });

      toast({
        title: newStatus ? "You are now online" : "You are now offline",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to update status",
        status: "error",
      });
    }
  };

  const pendingRides = rides.filter((r) => r.status === "pending");
  const activeRide = rides.find(
    (r) =>
      r.driverId === driverId &&
      ["accepted", "in_progress", "payment_pending"].includes(r.status)
  );

  const completedRides = rides.filter(
    (r) => r.driverId === driverId && r.status === "completed"
  );

  const recentRides = completedRides.slice(-3).reverse();

  const totalEarnings = completedRides.reduce(
    (sum, ride) => sum + Number(ride.fare || 0),
    0
  );

  const averageRating =
    completedRides.length > 0
      ? (
          completedRides.reduce(
            (sum, ride) => sum + Number(ride.driverRating || 5),
            0
          ) / completedRides.length
        ).toFixed(1)
      : "5.0";

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading>Driver Dashboard</Heading>

        <HStack>
          <Text fontWeight="bold">
            {isOnline ? "ONLINE" : "OFFLINE"}
          </Text>
          <Switch
            colorScheme="green"
            isChecked={isOnline}
            onChange={toggleOnlineStatus}
          />
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
        <Stat p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <StatLabel>Pending Requests</StatLabel>
          <StatNumber>{pendingRides.length}</StatNumber>
        </Stat>

        <Stat p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <StatLabel>Completed Rides</StatLabel>
          <StatNumber>{completedRides.length}</StatNumber>
        </Stat>

        <Stat p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <StatLabel>Total Earnings</StatLabel>
          <StatNumber>₹{totalEarnings}</StatNumber>
        </Stat>

        <Stat p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <StatLabel>Driver Rating</StatLabel>
          <StatNumber>⭐ {averageRating}</StatNumber>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={8}>
        <Box p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>
            Current Active Ride
          </Heading>

          {activeRide ? (
            <VStack align="start" spacing={2}>
              <Text><strong>Pickup:</strong> {activeRide.pickupLocation}</Text>
              <Text><strong>Dropoff:</strong> {activeRide.dropoffLocation}</Text>
              <Text><strong>Fare:</strong> ₹{activeRide.fare || 50}</Text>
              <Badge colorScheme="blue">{activeRide.status}</Badge>
            </VStack>
          ) : (
            <Text>No active ride.</Text>
          )}
        </Box>

        <Box p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>
            Vehicle Info
          </Heading>

          <VStack align="start" spacing={2}>
            <Text><strong>Vehicle:</strong> {driverData?.vehicleInfo || "Not added"}</Text>
            <Text><strong>License:</strong> {driverData?.licensePlate || "Not added"}</Text>
            <Text><strong>Name:</strong> {driverData?.name || "Driver"}</Text>
          </VStack>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={8}>
        <Box p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>
            Recent Trips
          </Heading>

          {recentRides.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              {recentRides.map((ride) => (
                <Box key={ride.id}>
                  <Text fontWeight="bold">
                    {ride.pickupLocation} → {ride.dropoffLocation}
                  </Text>
                  <Text>₹{ride.fare || 50}</Text>
                  <Divider mt={2} />
                </Box>
              ))}
            </VStack>
          ) : (
            <Text>No recent trips.</Text>
          )}
        </Box>

        <Box p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>
            New Ride Requests
          </Heading>

          {pendingRides.slice(0, 2).map((ride) => (
            <Box key={ride.id} mb={4}>
              <Text fontWeight="bold">
                {ride.pickupLocation} → {ride.dropoffLocation}
              </Text>
              <Text>₹{ride.fare || 50}</Text>
              <Button
  mt={2}
  size="sm"
  colorScheme="green"
  onClick={() => navigate("/available-rides")}
>
  View Requests
</Button>
            </Box>
          ))}

          {pendingRides.length === 0 && <Text>No pending requests.</Text>}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default DriverDashboard;