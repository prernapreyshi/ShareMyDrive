import React from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";
import { auth } from "../firebase/firebaseConfig";

const MotionBox = motion(Box);

const Sidebar = () => {
  const navigate = useNavigate();
  const sidebarBg = useColorModeValue("gray.50", "gray.800");

  const navItems = [
    { label: "Home", icon: <FiHome />, path: "/home" }, // ✅ Updated from "/" to "/home"
    { label: "User Info", icon: <FiUser />, path: "/edit-profile" },
    { label: "Settings", icon: <FiSettings />, path: "/settings" },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <MotionBox
      w="240px"
      h="100vh"
      position="fixed"
      left="0"
      top="0"
      bg={sidebarBg}
      boxShadow="lg"
      p={5}
      zIndex={1000}
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <VStack align="start" spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
          ShareMyDrive
        </Text>

        {navItems.map((item) => (
          <Tooltip label={item.label} key={item.label} placement="right">
            <Button
              leftIcon={item.icon}
              variant="ghost"
              width="full"
              justifyContent="flex-start"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          </Tooltip>
        ))}

        <Button
          leftIcon={<FiLogOut />}
          colorScheme="red"
          variant="ghost"
          width="full"
          justifyContent="flex-start"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </VStack>
    </MotionBox>
  );
};

export default Sidebar;
