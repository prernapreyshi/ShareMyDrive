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
  Avatar,
  Spacer,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";
import { FiLogOut } from "react-icons/fi";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const HomeNavbar = () => {
  const { user, role, logoutUser } = useUser();
  const navigate = useNavigate();

  const dashboardPath =
    role === "rider"
      ? "/rider-dashboard"
      : role === "driver"
      ? "/driver-dashboard"
      : null;

  const scrollToSection = (sectionId) => {
    if (window.location.pathname !== "/home") {
      navigate("/home");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <MotionBox
      bg={useColorModeValue("white", "gray.900")}
      px={{ base: 4, md: 8 }}
      py={4}
      shadow="sm"
      borderBottom="1px solid"
      borderColor="gray.200"
      position="sticky"
      top="0"
      zIndex="1000"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Flex h={16} alignItems="center">
        <Text
          fontWeight="bold"
          fontSize="2xl"
          color="teal.500"
          cursor="pointer"
          onClick={() => navigate("/home")}
        >
          ShareMyDrive
        </Text>

        <HStack spacing={8} ml={12}>
          <ChakraLink
            fontWeight="medium"
            cursor="pointer"
            _hover={{ color: "teal.500", textDecoration: "none" }}
            onClick={() => scrollToSection("services")}
          >
            Services
          </ChakraLink>

          <ChakraLink
            fontWeight="medium"
            cursor="pointer"
            _hover={{ color: "teal.500", textDecoration: "none" }}
            onClick={() => scrollToSection("about")}
          >
            About Us
          </ChakraLink>

          <ChakraLink
            fontWeight="medium"
            cursor="pointer"
            _hover={{ color: "teal.500", textDecoration: "none" }}
            onClick={() => scrollToSection("contact")}
          >
            Contact Us
          </ChakraLink>
        </HStack>

        <Spacer />

        <HStack spacing={3}>
          {user ? (
            <>
              {dashboardPath && (
                <MotionButton
                  colorScheme="teal"
                  borderRadius="full"
                  px={6}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(dashboardPath)}
                >
                  Dashboard
                </MotionButton>
              )}

              <Tooltip label="Profile">
                <Avatar
                  size="sm"
                  src="https://api.dicebear.com/7.x/personas/svg?seed=neutral"
                  cursor="pointer"
                  onClick={() => navigate("/edit-profile")}
                />
              </Tooltip>

              <Tooltip label="Logout">
                <IconButton
                  icon={<FiLogOut />}
                  colorScheme="red"
                  variant="ghost"
                  borderRadius="full"
                  aria-label="Logout"
                  onClick={logoutUser}
                />
              </Tooltip>
            </>
          ) : (
            <>
              <Link to="/login">
                <MotionButton
                  colorScheme="teal"
                  borderRadius="full"
                  px={6}
                  whileHover={{ scale: 1.05 }}
                >
                  Login
                </MotionButton>
              </Link>

              <Link to="/select-role">
                <MotionButton
                  variant="outline"
                  colorScheme="teal"
                  borderRadius="full"
                  px={6}
                  whileHover={{ scale: 1.05 }}
                >
                  Get Started
                </MotionButton>
              </Link>
            </>
          )}
        </HStack>
      </Flex>
    </MotionBox>
  );
};

export default HomeNavbar;