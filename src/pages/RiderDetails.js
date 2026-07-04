// src/pages/RiderDetails.js
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
  VStack,
  Text,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { FiUser, FiPhone } from "react-icons/fi";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const RiderDetails = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast({
        title: "Please login first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!name.trim() || !phone.trim()) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (phone.length < 10) {
      toast({
        title: "Enter a valid phone number",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSaving(true);

      await setDoc(doc(db, "riders", user.uid), {
        name,
        phone,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Profile saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/rider-dashboard");
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <MotionBox
        maxW="500px"
        w="100%"
        bg="white"
        p={8}
        borderRadius="2xl"
        boxShadow="xl"
        border="1px solid"
        borderColor="gray.100"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading
          mb={2}
          textAlign="center"
          color="teal.500"
          fontSize="3xl"
        >
          Complete Rider Profile
        </Heading>

        <Text
          textAlign="center"
          color="gray.500"
          mb={8}
        >
          Add your details to continue booking rides
        </Text>

        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiUser color="gray" />
              </InputLeftElement>

              <Input
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                focusBorderColor="teal.400"
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiPhone color="gray" />
              </InputLeftElement>

              <Input
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                focusBorderColor="teal.400"
              />
            </InputGroup>
          </FormControl>

          <MotionButton
            width="100%"
            size="lg"
            colorScheme="teal"
            borderRadius="xl"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            isLoading={saving}
            loadingText="Saving..."
          >
            Save & Continue
          </MotionButton>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default RiderDetails;