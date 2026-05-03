import React from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  VStack,
  useColorModeValue,
  Button,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHandshake,
  FaLeaf,
  FaUserShield,
  FaRoute,
  FaMobileAlt,
  FaUsers,
} from "react-icons/fa";

// ✅ Image imports from assets
import ShareImage from "../assets/share.svg";
import StepsImage from "../assets/steps.svg";
import ImpactImage from "../assets/impact.svg";

const MotionBox = motion(Box);

const About = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");

  const values = [
    {
      icon: FaUserShield,
      title: "Verified Users",
      description: "Every user is verified via Aadhaar and mobile for complete trust and safety.",
      color: "blue.500",
    },
    {
      icon: FaLeaf,
      title: "Eco-Friendly Travel",
      description: "Reduce fuel consumption and pollution by sharing your ride responsibly.",
      color: "green.500",
    },
    {
      icon: FaHandshake,
      title: "Connect & Share",
      description: "Make new friends by connecting with fellow travelers headed your way.",
      color: "purple.500",
    },
  ];

  const sections = [
    {
      icon: FaRoute,
      title: "Why ShareMyDrive?",
      text: "ShareMyDrive was born to simplify travel, reduce traffic, and encourage smart carpooling. Whether you're commuting daily or going on a road trip, we help you find the right match to share your journey.",
      highlight: "Smart. Social. Sustainable.",
      color: "blue.600",
      image: ShareImage,
    },
    {
      icon: FaMobileAlt,
      title: "How It Works",
      text: "Users can register as riders or drivers. With our smart match system, find verified people going your way and enjoy affordable and safe rides together.",
      highlight: "Register ➝ Select Role ➝ Match & Ride!",
      color: "teal.500",
      image: StepsImage,
    },
    {
      icon: FaUsers,
      title: "Our Impact",
      text: "With every ride shared, we reduce carbon footprint and build a connected travel culture. Join our mission and be a part of India's modern transport movement.",
      highlight: "Together, we drive a better tomorrow.",
      color: "green.600",
      image: ImpactImage,
    },
  ];

  return (
    <Box bg={bgColor} px={{ base: 6, md: 10 }} py={10}>
      <Box textAlign="center" mb={10}>
        <Heading fontSize="4xl" mb={3}>About ShareMyRide</Heading>
        <Text fontSize="lg" maxW="3xl" mx="auto" color="gray.600">
          We’re redefining the way India commutes — safer, greener, and smarter through real-time carpooling.
        </Text>
      </Box>

      {sections.map((section, index) => (
        <SimpleGrid
          key={index}
          columns={{ base: 1, md: 2 }}
          spacing={10}
          alignItems="center"
          mb={16}
        >
          <MotionBox
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            textAlign="center"
          >
            <Image
              src={section.image}
              alt={section.title}
              maxH="250px"
              mx="auto"
              borderRadius="xl"
            />
          </MotionBox>

          <Box textAlign={{ base: "center", md: "left" }}>
            <Heading fontSize="2xl" mb={2} display="flex" alignItems="center">
              <Icon as={section.icon} color={section.color} mr={2} /> {section.title}
            </Heading>
            <Text fontSize="md" color="gray.600" mb={3}>{section.text}</Text>
            <Text fontWeight="bold" fontSize="lg" color={section.color}>
              {section.highlight}
            </Text>
          </Box>
        </SimpleGrid>
      ))}

      <Box textAlign="center" mb={16}>
        <Heading fontSize="2xl" mb={6}>What We Stand For</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {values.map((item, idx) => (
            <MotionBox
              key={idx}
              p={6}
              bg={cardBg}
              borderRadius="xl"
              shadow="md"
              whileHover={{ y: -5, boxShadow: "lg" }}
              transition={{ duration: 0.3 }}
            >
              <Icon as={item.icon} boxSize={10} color={item.color} mb={4} />
              <Heading fontSize="lg" mb={2}>{item.title}</Heading>
              <Text color="gray.600">{item.description}</Text>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Box>

      <VStack spacing={4} textAlign="center">
        <Heading fontSize="2xl">Start Your Shared Journey Today</Heading>
        <Text fontSize="md" color="gray.600">
          Join the growing community reshaping travel across India.
        </Text>
        <Button
          size="lg"
          colorScheme="blue"
          px={8}
          onClick={() => navigate("/select-role")}
        >
          Get Started
        </Button>
      </VStack>
    </Box>
  );
};

export default About;
