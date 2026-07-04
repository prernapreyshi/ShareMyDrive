// Components/AppNavbar.js
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

const AppNavbar = () => {
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
            <Link to="/">
              <ChakraLink>Home</ChakraLink>
            </Link>
            <Link to="/#services">
              <ChakraLink>Services</ChakraLink>
            </Link>
            <Link to="/#about">
              <ChakraLink>About Us</ChakraLink>
            </Link>
            <Link to="/#contact">
              <ChakraLink>Contact Us</ChakraLink>
            </Link>
          </HStack>
        </HStack>
        <HStack spacing={4}>
          <Link to="/logout">
            <MotionButton colorScheme="red" whileHover={{ scale: 1.05 }}>
              Logout
            </MotionButton>
          </Link>
        </HStack>
      </Flex>
    </MotionBox>
  );
};

export default AppNavbar;
