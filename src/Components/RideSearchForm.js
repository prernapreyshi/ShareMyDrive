import React from "react";
import {
  Box,
  Stack,
  Input,
  Button,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

// Motion wrappers
const MotionBox = motion(Box);
const MotionButton = motion(Button);

const RideSearchForm = () => {
  return (
    <MotionBox
      p={6}
      bg="white"
      shadow="base"
      rounded="md"
      maxW="lg"
      mx="auto"
      mt={10}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <form>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>From</FormLabel>
            <Input placeholder="Start location" />
          </FormControl>
          <FormControl>
            <FormLabel>To</FormLabel>
            <Input placeholder="Destination" />
          </FormControl>
          <FormControl>
            <FormLabel>Date</FormLabel>
            <Input type="date" />
          </FormControl>
          <MotionButton
            type="submit"
            colorScheme="brand"
            size="md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Search Ride
          </MotionButton>
        </Stack>
      </form>
    </MotionBox>
  );
};

export default RideSearchForm;
