import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Motion-enabled components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionImage = motion(Image);

const RideCard = ({ ride }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.700");

  const { pickupLocation, dropoffLocation, date, time, status, pickupCoords, dropoffCoords } = ride;

  const hasValidCoords =
    pickupCoords?.lat &&
    pickupCoords?.lon &&
    dropoffCoords?.lat &&
    dropoffCoords?.lon;

  const mapUrl = hasValidCoords
    ? `https://maps.locationiq.com/v3/staticmap?key=pk.02a082d9834c35563c931be2cf773633&center=${pickupCoords.lat},${pickupCoords.lon}&zoom=13&size=600x300&markers=icon:large-red-cutout|${pickupCoords.lat},${pickupCoords.lon}|icon:large-blue-cutout|${dropoffCoords.lat},${dropoffCoords.lon}&path=color:0x6600ff|weight:3|${pickupCoords.lat},${pickupCoords.lon}|${dropoffCoords.lat},${dropoffCoords.lon}`
    : null;

  return (
    <MotionBox
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="md"
      bg={cardBg}
      mb={4}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Heading fontSize="xl" mb={2}>
        {pickupLocation} → {dropoffLocation}
      </Heading>

      <VStack align="start" spacing={1} mb={4}>
        <Text>Date: {date}</Text>
        <Text>Time: {time}</Text>
        <Text>Status: {status}</Text>
      </VStack>

      {mapUrl ? (
        <MotionImage
          src={mapUrl}
          alt="Ride map preview"
          borderRadius="md"
          mb={4}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      ) : (
        <Text fontSize="sm" color="gray.500" mb={4}>
          Map preview not available.
        </Text>
      )}

      <Flex justify="flex-end">
        <MotionButton
          colorScheme="brand"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/ride-details/${ride.id}`)}
        >
          View Details
        </MotionButton>
      </Flex>
    </MotionBox>
  );
};

export default RideCard;
