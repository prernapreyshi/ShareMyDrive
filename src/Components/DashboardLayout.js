import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiGrid,
} from "react-icons/fi";

const SidebarItem = ({ icon, label, onClick, active }) => (
  <Button
    leftIcon={icon}
    variant={active ? "solid" : "ghost"}
    justifyContent="flex-start"
    width="100%"
    onClick={onClick}
    fontWeight="medium"
    fontSize="md"
    colorScheme={active ? "teal" : undefined}
  >
    {label}
  </Button>
);

const DashboardLayout = ({ children, userInfo, userType = "driver" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue("gray.100", "gray.800");
  const isDriver = userType === "driver";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const currentPath = location.pathname;
  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w={{ base: "full", md: 64 }}
        bg={bg}
        p={5}
        borderRightWidth="1px"
        boxShadow="lg"
      >
        <VStack align="start" spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            ShareMyDrive
          </Text>
          <SidebarItem
            icon={<FiHome />}
            label="Home"
            onClick={() => navigate("/")}
            active={currentPath === "/"}
          />
          <SidebarItem
            icon={<FiGrid />}
            label="Dashboard"
            onClick={() =>
              navigate(isDriver ? "/driver-dashboard" : "/rider-dashboard")
            }
            active={currentPath.includes("-dashboard")}
          />
          <SidebarItem
            icon={<FiUser />}
            label="User Info"
            onClick={() => navigate("/edit-profile")}
            active={currentPath === "/edit-profile"}
          />
          <SidebarItem
            icon={<FiSettings />}
            label="Settings"
            onClick={() => navigate("/settings")}
            active={currentPath === "/settings"}
          />
          <SidebarItem
            icon={<FiLogOut />}
            label="Logout"
            onClick={handleLogout}
            active={false}
          />
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex="1" p={6}>
        <HStack justify="space-between" mb={6}>
          <Text fontSize="2xl" fontWeight="bold">
            {isDriver ? "Driver Dashboard" : "Rider Dashboard"}
          </Text>
          {userInfo && (
            <HStack>
              <Avatar size="sm" name={userInfo.name || "User"} />
              <Text fontWeight="medium">{userInfo.name || userInfo.email}</Text>
            </HStack>
          )}
        </HStack>
        {children}
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
