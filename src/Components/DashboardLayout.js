import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiGrid,
  FiClock,
  FiPlusCircle,
  FiList,
} from "react-icons/fi";
import SOSButton from "./SOSButton";

const SidebarItem = ({ icon, label, onClick, active }) => (
  <Button
    leftIcon={icon}
    variant={active ? "solid" : "ghost"}
    justifyContent="flex-start"
    width="100%"
    onClick={onClick}
    fontWeight="medium"
    fontSize="sm"
    colorScheme={active ? "teal" : undefined}
    _hover={{ bg: active ? undefined : "teal.50", color: "teal.600" }}
    transition="all 0.15s"
  >
    {label}
  </Button>
);

const DashboardLayout = ({ children, userInfo, userType = "driver" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const bg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const isDriver = userType === "driver";
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const commonItems = [
    { icon: <FiHome />, label: "Home", path: "/home" },
    { icon: <FiGrid />, label: "Dashboard", path: isDriver ? "/driver-dashboard" : "/rider-dashboard" },
  ];

  const roleItems = isDriver
    ? [
        { icon: <FiList />, label: "Ride Requests", path: "/available-rides" },
        { icon: <FiClock />, label: "Ride History", path: "/booking-history" },
      ]
    : [
        { icon: <FiPlusCircle />, label: "Request a Ride", path: "/request-ride" },
        { icon: <FiClock />, label: "Ride History", path: "/booking-history" },
      ];

  const accountItems = [
    { icon: <FiUser />, label: "Edit Profile", path: "/edit-profile" },
    { icon: <FiSettings />, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => currentPath === path;

  const PAGE_TITLES = {
    "/driver-dashboard": "Driver Dashboard",
    "/rider-dashboard": "Rider Dashboard",
    "/available-rides": "Ride Requests",
    "/booking-history": "Ride History",
    "/edit-profile": "Edit Profile",
    "/settings": "Settings",
    "/request-ride": "Request a Ride",
  };
  const pageTitle = PAGE_TITLES[currentPath] || (isDriver ? "Driver Dashboard" : "Rider Dashboard");

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w={{ base: "full", md: "240px" }}
        minH="100vh"
        bg={bg}
        borderRightWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
        display="flex"
        flexDirection="column"
        py={5}
        px={4}
        position="sticky"
        top={0}
        alignSelf="flex-start"
        h="100vh"
        overflowY="auto"
      >
        <Text fontSize="xl" fontWeight="bold" color="teal.500" mb={6} px={2}>
          ShareMyDrive
        </Text>

        <VStack align="start" spacing={1} flex={1}>
          {commonItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              onClick={() => navigate(item.path)}
              active={isActive(item.path)}
            />
          ))}

          <Box w="full" py={2}>
            <Divider />
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" mt={2} mb={1} px={2}>
              {isDriver ? "DRIVER" : "RIDER"}
            </Text>
          </Box>

          {roleItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              onClick={() => navigate(item.path)}
              active={isActive(item.path)}
            />
          ))}

          <Box w="full" py={2}>
            <Divider />
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" mt={2} mb={1} px={2}>
              ACCOUNT
            </Text>
          </Box>

          {accountItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              onClick={() => navigate(item.path)}
              active={isActive(item.path)}
            />
          ))}
        </VStack>

        <Box mt="auto" pt={4} borderTopWidth="1px" borderColor={borderColor}>
          <SidebarItem
            icon={<FiLogOut />}
            label="Logout"
            onClick={handleLogout}
            active={false}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex="1" p={6} position="relative" overflowY="auto">
        <HStack justify="space-between" mb={6}>
          <Text fontSize="2xl" fontWeight="bold">
            {pageTitle}
          </Text>
          {(userInfo || user) && (
            <HStack spacing={3}>
 <Avatar
  size="md"
  src="https://api.dicebear.com/7.x/personas/svg?seed=neutral"
  cursor="pointer"
  onClick={() => navigate("/edit-profile")}
/>
</HStack>
          )}
        </HStack>
        {children}
        <SOSButton />
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
