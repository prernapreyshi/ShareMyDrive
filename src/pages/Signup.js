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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(Button);
const MotionVStack = motion(VStack);

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      return toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    if (password.length < 6) {
      return toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        createdAt: new Date(),
        role: null,
      });

      toast({
        title: "Signup Successful",
        description: "Please choose your role next.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/select-role");
    } catch (err) {
      toast({
        title: "Signup Failed",
        description: getFriendlyError(err.code),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <MotionBox
      maxW="md"
      mx="auto"
      mt={20}
      p={8}
      borderRadius="2xl"
      bg={useColorModeValue("white", "gray.700")}
      boxShadow="2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Heading mb={6} textAlign="center" color="blue.400">
        Create Account
      </Heading>
      <MotionVStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <MotionInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            whileFocus={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <MotionInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            whileFocus={{ scale: 1.03 }}
          />
        </FormControl>

        <MotionButton
          colorScheme="blue"
          width="full"
          onClick={handleSignup}
          isDisabled={!email || !password}
          isLoading={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign Up
        </MotionButton>

        <Text fontSize="sm" textAlign="center" mt={2}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#ce63ff" }}>
            Sign In
          </Link>
        </Text>
      </MotionVStack>
    </MotionBox>
  );
};

export default Signup;
