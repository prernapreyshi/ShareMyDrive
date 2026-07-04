import React from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

// Framer Motion wrappers
const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionInput = motion(Input);
const MotionButton = motion(Button);

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ShowMyRidePage = () => {
  return (
    <Box
      bg={useColorModeValue("gray.50")}
      minH="100vh"
      py={20}
      px={{ base: 6, md: 20 }}
    >
      <Heading textAlign="center" mb={10} color="gray.800">
        Show My Ride
      </Heading>

      <MotionBox
        maxW="3xl"
        mx="auto"
        bg="white"
        p={{ base: 8, md: 12 }}
        borderRadius="xl"
        boxShadow="2xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <MotionStack spacing={8} variants={containerVariants}>
          <MotionInput
            placeholder="From"
            size="lg"
            bg="gray.50"
            _focus={{ borderColor: "teal.500" }}
            variants={itemVariants}
          />
          <MotionInput
            placeholder="To"
            size="lg"
            bg="gray.50"
            _focus={{ borderColor: "teal.500" }}
            variants={itemVariants}
          />
          <MotionInput
            type="date"
            size="lg"
            bg="gray.50"
            _focus={{ borderColor: "teal.500" }}
            variants={itemVariants}
          />
          <MotionButton
            colorScheme="teal"
            size="lg"
            px={10}
            fontWeight="bold"
            alignSelf="flex-start"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            variants={itemVariants}
          >
            Search
          </MotionButton>
        </MotionStack>
      </MotionBox>
    </Box>
  );
};

export default ShowMyRidePage;
