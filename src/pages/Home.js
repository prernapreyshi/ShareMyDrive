import React, { useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

import HeroImage from "../assets/homeTheme.svg";
import FooterSection from "./FooterSection";
import ServicesSection from "../Components/ServicesSection";
import ShowMyRidePage from "../Components/ShowMyRidePage";
import About from "./About";

const Home = () => {
  const showRideRef = useRef(null);
  const navigate = useNavigate();
  const { user, role } = useUser();

  const handleGetStarted = () => {
    if (user) {
      if (role === "driver") {
        navigate("/driver-dashboard");
      } else if (role === "rider") {
        navigate("/rider-dashboard");
      }
    } else {
      showRideRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <Box bg="gray.50">
      {/* Hero Section */}
      <Flex
        align="center"
        justify="space-between"
        px={{ base: 6, md: 10 }}
        py={20}
        direction={{ base: "column", md: "row" }}
      >
        <Box maxW="lg" textAlign={{ base: "center", md: "left" }}>
          <Heading size="2xl" mb={4}>
            {user
              ? `Welcome back, ${role === "driver" ? "Driver" : "Rider"} 👋`
              : "Make Awesome Travel Easy & Affordable"}
          </Heading>

          <Text fontSize="lg" mb={6}>
            {user
              ? role === "driver"
                ? "Ready to accept new ride requests and start earning?"
                : "Book your next safe and affordable ride."
              : "Share rides to move from local hosts across the country."}
          </Text>

          <Button colorScheme="teal" size="lg" onClick={handleGetStarted}>
            {user
              ? role === "driver"
                ? "View Ride Requests"
                : "Book a Ride"
              : "Get Started"}
          </Button>
        </Box>

        <Image
          src={HeroImage}
          alt="Travel Illustration"
          maxW="500px"
          mt={{ base: 10, md: 0 }}
        />
      </Flex>

      {/* Guest only */}
      {!user && (
        <Box ref={showRideRef}>
          <ShowMyRidePage />
        </Box>
      )}

      {/* Always visible for all users */}
      <Box id="services" py={20} px={{ base: 6, md: 10 }}>
        <ServicesSection />
      </Box>

      <Box id="about" py={20} px={{ base: 6, md: 10 }}>
        <About />
      </Box>

      <Box id="contact">
        <FooterSection />
      </Box>
    </Box>
  );
};

export default Home;