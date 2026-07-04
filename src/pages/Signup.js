import React, { useState, useEffect } from "react";
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
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { motion } from "framer-motion";

// Framer Motion
const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(Button);
const MotionVStack = motion(VStack);

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => console.log("reCAPTCHA verified"),
        },
        auth
      );
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  };

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      return toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      let appVerifier;

      if (window.location.hostname === "localhost") {
        auth.settings.appVerificationDisabledForTesting = true;

        class MockRecaptchaVerifier {
          type = "recaptcha";
          verify() {
            return Promise.resolve("test-verification-code");
          }
          render() {
            return Promise.resolve(0);
          }
          clear() {}
          _reset() {}
        }

        appVerifier = new MockRecaptchaVerifier();
      } else {
        setUpRecaptcha();
        appVerifier = window.recaptchaVerifier;
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);

      toast({
        title: "OTP Sent",
        description: "Please check your phone.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "OTP Failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const verifyOtpAndSignup = async () => {
    if (!confirmationResult || !otp) {
      return toast({
        title: "OTP Missing",
        description: "Please enter the OTP.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      await confirmationResult.confirm(otp);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        phone,
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
        title: "Verification Failed",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear?.();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

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

        <FormControl isRequired>
          <FormLabel>Mobile Number</FormLabel>
          <MotionInput
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            whileFocus={{ scale: 1.03 }}
          />
        </FormControl>

        {confirmationResult && (
          <FormControl isRequired>
            <FormLabel>Enter OTP</FormLabel>
            <MotionInput
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileFocus={{ scale: 1.03 }}
            />
          </FormControl>
        )}

        {!confirmationResult ? (
          <MotionButton
            colorScheme="blue"
            width="full"
            onClick={sendOtp}
            isDisabled={!phone}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send OTP
          </MotionButton>
        ) : (
          <MotionButton
            colorScheme="green"
            width="full"
            onClick={verifyOtpAndSignup}
            isDisabled={!otp || !email || !password}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Verify OTP & Sign Up
          </MotionButton>
        )}

        <Text fontSize="sm" textAlign="center" mt={2}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#ce63ff" }}>
            Sign In
          </Link>
        </Text>
      </MotionVStack>

      <div id="recaptcha-container"></div>
    </MotionBox>
  );
};

export default Signup;
