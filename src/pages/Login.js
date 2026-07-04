import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  Text,
  VStack,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, db, googleProvider } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Framer Motion wrapper component
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), { role: null }, { merge: true });

      toast({
        title: "Login Successful",
        description: "Please select your role again.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/select-role");
    } catch (err) {
      toast({
        title: "Login Failed",
        description: getFriendlyError(err.code),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const uid = user.uid;

      await setDoc(doc(db, "users", uid), { role: null }, { merge: true });

      toast({
        title: "Google Login Successful",
        description: "Please select your role again.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/select-role");
    } catch (err) {
      toast({
        title: "Google Sign-In Failed",
        description: getFriendlyError(err.code),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/invalid-credential":
        return "Incorrect credentials or unregistered account.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was canceled.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      maxW="md"
      mx="auto"
      mt={20}
      p={8}
      bg={useColorModeValue("white", "gray.700")}
      borderRadius="2xl"
      boxShadow="2xl"
    >
      <Heading mb={6} textAlign="center" color="brand.400">
        Sign In
      </Heading>

      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <MotionButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          colorScheme="brand"
          width="full"
          onClick={handleLogin}
          isDisabled={!email || !password}
        >
          Sign In
        </MotionButton>

        <Text fontSize="sm" textAlign="center" mt={2}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#ce63ff" }}>
            Sign Up
          </Link>
        </Text>

        <Text mt={4} fontSize="sm" color="gray.500">
          OR
        </Text>

        <MotionButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          width="full"
          onClick={handleGoogleLogin}
          bg="red.500"
          color="white"
          _hover={{ bg: "red.600" }}
        >
          Continue with Google
        </MotionButton>
      </VStack>
    </MotionBox>
  );
};

export default Login;
