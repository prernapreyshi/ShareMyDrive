// Components/HomeNavbar.js
import React from "react";
import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const HomeNavbar = () => {
  return (
    <MotionBox
      bg={useColorModeValue("white", "gray.900")}
      px={6}
      py={4}
      shadow="md"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={10}>
          <Text fontWeight="bold" fontSize="xl" color="brand.400">
            ShareMyDrive
          </Text>
          <HStack spacing={6} fontWeight="medium">
            <ChakraLink href="#services">Services</ChakraLink>
            <ChakraLink href="#about">About Us</ChakraLink>
            <ChakraLink href="#contact">Contact Us</ChakraLink>
          </HStack>
        </HStack>
        <HStack spacing={4}>
          <Link to="/login">
            <MotionButton colorScheme="brand" whileHover={{ scale: 1.05 }}>
              Login
            </MotionButton>
          </Link>
          <Link to="/select-role">
            <MotionButton colorScheme="brand" whileHover={{ scale: 1.05 }}>
              Get Started
            </MotionButton>
          </Link>
        </HStack>
      </Flex>
    </MotionBox>
  );
};

export default HomeNavbar;
