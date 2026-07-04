import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Image,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

// Motion-enabled Chakra components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionImage = motion(Image);

const HeroSection = () => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      py={{ base: 16, md: 24 }}
      px={{ base: 6, md: 12 }}
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        align="center"
        spacing={{ base: 12, md: 16 }}
      >
        {/* Left Text Section with slide-from-left */}
        <MotionBox
          flex="1"
          textAlign={{ base: "center", md: "left" }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Heading
            size="2xl"
            mb={4}
            color="brand.400"
            fontWeight="bold"
            lineHeight="1.2"
          >
            Share Your Ride, <br /> Share the Joy
          </Heading>
          <Text fontSize="xl" mb={6} color="gray.600">
            Find trusted rides or share yours — safe, easy, and affordable.
          </Text>

          <MotionButton
            size="lg"
            bg="brand.400"
            color="white"
            _hover={{ bg: "brand.300" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Get Started
          </MotionButton>
        </MotionBox>

        {/* Right Image Section with slide-from-right */}
        <MotionBox
          flex="1"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <MotionImage
            src="./assets/carRide.svg"
            alt="Hero Illustration"
            objectFit="cover"
            maxH={{ base: "300px", md: "400px" }}
            mx="auto"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </MotionBox>
      </Stack>
    </Box>
  );
};

export default HeroSection;
