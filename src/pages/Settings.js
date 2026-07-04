import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Switch,
  Divider,
  Button,
  useColorMode,
  useToast,
  Badge,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";

const SettingRow = ({ label, description, children }) => (
  <HStack justify="space-between" w="full" py={3}>
    <Box>
      <Text fontWeight="semibold">{label}</Text>
      {description && (
        <Text fontSize="sm" color="gray.500">
          {description}
        </Text>
      )}
    </Box>
    {children}
  </HStack>
);

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, role } = useUser();
  const toast = useToast();

  const [notifications, setNotifications] = useState({
    rideUpdates: true,
    promoEmails: false,
    smsAlerts: true,
  });

  const [language, setLanguage] = useState("en");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="2xl" mx="auto" py={4}>
      <Heading mb={6}>⚙️ Settings</Heading>

      {/* Account Info */}
      <Box p={5} borderWidth="1px" borderRadius="lg" mb={6} boxShadow="sm">
        <Text fontWeight="bold" fontSize="lg" mb={3}>
          Account
        </Text>
        <VStack align="start" spacing={2}>
          <HStack>
            <Text color="gray.500">Email:</Text>
            <Text fontWeight="medium">{user?.email || "—"}</Text>
          </HStack>
          <HStack>
            <Text color="gray.500">Role:</Text>
            <Badge colorScheme={role === "driver" ? "purple" : "teal"}>
              {role?.toUpperCase() || "—"}
            </Badge>
          </HStack>
        </VStack>
      </Box>

      {/* Appearance */}
      <Box p={5} borderWidth="1px" borderRadius="lg" mb={6} boxShadow="sm">
        <Text fontWeight="bold" fontSize="lg" mb={3}>
          Appearance
        </Text>
        <Divider mb={3} />
        <SettingRow
          label="Dark Mode"
          description="Switch between light and dark theme"
        >
          <Switch
            isChecked={colorMode === "dark"}
            onChange={toggleColorMode}
            colorScheme="teal"
          />
        </SettingRow>

        <Divider />

        <FormControl mt={3}>
          <FormLabel fontWeight="semibold">Language</FormLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            maxW="200px"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="ta">Tamil</option>
          </Select>
        </FormControl>
      </Box>

      {/* Notifications */}
      <Box p={5} borderWidth="1px" borderRadius="lg" mb={6} boxShadow="sm">
        <Text fontWeight="bold" fontSize="lg" mb={3}>
          Notifications
        </Text>
        <Divider mb={3} />

        <VStack divider={<Divider />} spacing={0}>
          <SettingRow
            label="Ride Updates"
            description="Get notified when your ride status changes"
          >
            <Switch
              isChecked={notifications.rideUpdates}
              onChange={(e) =>
                setNotifications((n) => ({ ...n, rideUpdates: e.target.checked }))
              }
              colorScheme="teal"
            />
          </SettingRow>

          <SettingRow
            label="SMS Alerts"
            description="Receive SMS for important ride events"
          >
            <Switch
              isChecked={notifications.smsAlerts}
              onChange={(e) =>
                setNotifications((n) => ({ ...n, smsAlerts: e.target.checked }))
              }
              colorScheme="teal"
            />
          </SettingRow>

          <SettingRow
            label="Promotional Emails"
            description="News, offers and app updates"
          >
            <Switch
              isChecked={notifications.promoEmails}
              onChange={(e) =>
                setNotifications((n) => ({ ...n, promoEmails: e.target.checked }))
              }
              colorScheme="teal"
            />
          </SettingRow>
        </VStack>
      </Box>

      {/* Privacy */}
      <Box p={5} borderWidth="1px" borderRadius="lg" mb={6} boxShadow="sm">
        <Text fontWeight="bold" fontSize="lg" mb={3}>
          Privacy & Safety
        </Text>
        <Divider mb={3} />
        <Text fontSize="sm" color="gray.500" mb={3}>
          Your data is encrypted and never sold to third parties. Location is
          only shared during an active ride.
        </Text>
        <Button variant="outline" colorScheme="red" size="sm">
          Delete My Account
        </Button>
      </Box>

      <Button colorScheme="teal" onClick={handleSave} size="lg" w="full">
        Save Settings
      </Button>
    </Box>
  );
};

export default Settings;
