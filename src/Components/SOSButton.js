import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  Input,
  IconButton,
  useDisclosure,
  useToast,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// ─── Pulse ring animation around SOS button ───────────────────────────────────
const PulseRing = () => (
  <Box
    position="absolute"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)"
    borderRadius="full"
    border="3px solid"
    borderColor="red.400"
    pointerEvents="none"
    as={motion.div}
    animate={{
      scale: [1, 1.8, 1],
      opacity: [0.7, 0, 0.7],
    }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    w="60px"
    h="60px"
  />
);

// ─── Main Component ────────────────────────────────────────────────────────────
const SOSButton = ({ activeRide = null }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [contacts, setContacts] = useState([
    { name: "", phone: "" },
  ]);
  const [locating, setLocating] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);

  // ── Get current GPS location ────────────────────────────────────────────────
  const fetchLocation = () => {
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocationData({ latitude, longitude, accuracy });
        setLocating(false);
        toast({
          title: "Location acquired",
          description: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      (err) => {
        setLocationError("Could not get location. Please enable GPS.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Contact helpers ─────────────────────────────────────────────────────────
  const addContact = () => {
    if (contacts.length >= 3) return;
    setContacts((prev) => [...prev, { name: "", phone: "" }]);
  };

  const removeContact = (idx) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateContact = (idx, field, value) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  // ── 5-second countdown then send SOS ───────────────────────────────────────
  const startSOS = () => {
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          sendSOS();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    clearInterval(countdownRef.current);
    setCountdown(null);
    toast({ title: "SOS cancelled", status: "info", duration: 2000 });
  };

  // ── Save SOS alert to Firestore ────────────────────────────────────────────
  const sendSOS = async () => {
    setSending(true);
    try {
      const user = auth.currentUser;
      const validContacts = contacts.filter((c) => c.phone.trim() !== "");

      await addDoc(collection(db, "sosAlerts"), {
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "unknown",
        timestamp: serverTimestamp(),
        location: locationData
          ? {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy,
              googleMapsUrl: `https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`,
            }
          : null,
        emergencyContacts: validContacts,
        activeRide: activeRide
          ? {
              rideId: activeRide.id,
              pickupLocation: activeRide.pickupLocation,
              dropoffLocation: activeRide.dropoffLocation,
            }
          : null,
        status: "active",
      });

      setSosSent(true);
      toast({
        title: "🚨 SOS Alert Sent!",
        description:
          "Your emergency alert has been logged. Stay calm — help is on the way.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });

      // Build native SMS links for each contact
      validContacts.forEach(({ name, phone }) => {
        const msg = encodeURIComponent(
          `🚨 SOS from ShareMyDrive!\n` +
            (locationData
              ? `My location: https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}\n`
              : "") +
            `Please check on me immediately.`
        );
        // Open SMS for first contact; browsers may block multiple windows
        window.open(`sms:${phone}?body=${msg}`, "_blank");
      });
    } catch (err) {
      console.error("SOS send error:", err);
      toast({
        title: "Error",
        description: "Failed to send SOS. Please call emergency services directly.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  // ── Reset state when modal closes ──────────────────────────────────────────
  const handleClose = () => {
    clearInterval(countdownRef.current);
    setCountdown(null);
    setSosSent(false);
    setLocationData(null);
    setLocationError(null);
    setContacts([{ name: "", phone: "" }]);
    onClose();
  };

  return (
    <>
      {/* ── Floating SOS Button ── */}
      <Box position="fixed" bottom="28px" right="28px" zIndex={9999}>
        <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
          <PulseRing />
          <MotionButton
            onClick={onOpen}
            bg="red.500"
            color="white"
            borderRadius="full"
            w="60px"
            h="60px"
            fontSize="md"
            fontWeight="extrabold"
            boxShadow="0 4px 20px rgba(229,62,62,0.6)"
            _hover={{ bg: "red.600", transform: "scale(1.1)" }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            aria-label="SOS Emergency Button"
          >
            SOS
          </MotionButton>
        </Box>
      </Box>

      {/* ── SOS Modal ── */}
      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md" motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          {/* Red header bar */}
          <Box bg="red.500" px={6} py={4}>
            <HStack spacing={3}>
              <WarningTwoIcon color="white" boxSize={6} />
              <Text color="white" fontSize="xl" fontWeight="bold">
                Emergency SOS
              </Text>
              {sosSent && (
                <Badge colorScheme="whiteAlpha" variant="solid" bg="white" color="red.500">
                  ALERT SENT
                </Badge>
              )}
            </HStack>
            <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
              Your alert will be logged and sent to your emergency contacts.
            </Text>
          </Box>
          <ModalCloseButton color="white" top={4} right={4} />

          <ModalBody pt={5} pb={2}>
            <VStack spacing={5} align="stretch">
              {/* ── Active ride info ── */}
              {activeRide && (
                <Alert status="info" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  Active ride: {activeRide.pickupLocation} → {activeRide.dropoffLocation}
                </Alert>
              )}

              {/* ── Location section ── */}
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  📍 Share Your Location
                </Text>
                {locationData ? (
                  <Alert status="success" borderRadius="md" fontSize="sm">
                    <AlertIcon />
                    Location acquired — Lat {locationData.latitude.toFixed(5)}, Lng{" "}
                    {locationData.longitude.toFixed(5)}
                    &nbsp;(±{Math.round(locationData.accuracy)}m)
                  </Alert>
                ) : (
                  <>
                    {locationError && (
                      <Alert status="warning" borderRadius="md" mb={2} fontSize="sm">
                        <AlertIcon />
                        {locationError}
                      </Alert>
                    )}
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={fetchLocation}
                      isLoading={locating}
                      loadingText="Getting location…"
                      leftIcon={locating ? <Spinner size="xs" /> : undefined}
                    >
                      Get My Location
                    </Button>
                  </>
                )}
              </Box>

              <Divider />

              {/* ── Emergency contacts ── */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="semibold">👥 Emergency Contacts</Text>
                  {contacts.length < 3 && (
                    <Tooltip label="Add contact">
                      <IconButton
                        size="xs"
                        icon={<AddIcon />}
                        onClick={addContact}
                        colorScheme="teal"
                        variant="ghost"
                        aria-label="Add contact"
                      />
                    </Tooltip>
                  )}
                </HStack>
                <VStack spacing={3}>
                  {contacts.map((c, idx) => (
                    <HStack key={idx} spacing={2} w="100%">
                      <Input
                        placeholder="Name"
                        size="sm"
                        value={c.name}
                        onChange={(e) => updateContact(idx, "name", e.target.value)}
                        borderRadius="md"
                        flex={1}
                      />
                      <Input
                        placeholder="Phone number"
                        size="sm"
                        type="tel"
                        value={c.phone}
                        onChange={(e) => updateContact(idx, "phone", e.target.value)}
                        borderRadius="md"
                        flex={1.5}
                      />
                      {contacts.length > 1 && (
                        <IconButton
                          size="sm"
                          icon={<DeleteIcon />}
                          onClick={() => removeContact(idx)}
                          colorScheme="red"
                          variant="ghost"
                          aria-label="Remove contact"
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Contacts will receive an SMS with your location link.
                </Text>
              </Box>

              {/* ── SOS sent confirmation ── */}
              <AnimatePresence>
                {sosSent && (
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    bg="red.50"
                    border="2px solid"
                    borderColor="red.300"
                    borderRadius="xl"
                    p={4}
                    textAlign="center"
                  >
                    <Text fontSize="2xl">🚨</Text>
                    <Text fontWeight="bold" color="red.600">
                      SOS Alert Sent!
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Your emergency alert has been recorded. SMS links have been opened
                      for your contacts.
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      If in immediate danger, call <strong>112</strong> (India Emergency) now.
                    </Text>
                  </MotionBox>
                )}
              </AnimatePresence>
            </VStack>
          </ModalBody>

          <ModalFooter pt={3} pb={5} gap={3} flexDirection="column">
            {/* ── Countdown / Send button ── */}
            {!sosSent && (
              <>
                {countdown !== null ? (
                  <HStack w="100%" justify="center" spacing={4}>
                    <Box textAlign="center">
                      <Text fontSize="3xl" fontWeight="black" color="red.500">
                        {countdown}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Sending SOS…
                      </Text>
                    </Box>
                    <Button
                      colorScheme="gray"
                      variant="outline"
                      onClick={cancelCountdown}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    colorScheme="red"
                    size="lg"
                    w="100%"
                    borderRadius="xl"
                    fontWeight="black"
                    fontSize="lg"
                    isLoading={sending}
                    loadingText="Sending SOS…"
                    onClick={startSOS}
                    boxShadow="0 4px 14px rgba(229,62,62,0.45)"
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    🚨 SEND SOS NOW
                  </Button>
                )}
              </>
            )}

            {/* ── Emergency number quick-dial ── */}
            <HStack w="100%" justify="center" spacing={4} mt={1}>
              <Button
                as="a"
                href="tel:112"
                size="sm"
                colorScheme="red"
                variant="ghost"
                leftIcon={<Text>📞</Text>}
              >
                112 (Emergency)
              </Button>
              <Button
                as="a"
                href="tel:1091"
                size="sm"
                colorScheme="pink"
                variant="ghost"
                leftIcon={<Text>📞</Text>}
              >
                1091 (Women)
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SOSButton;
