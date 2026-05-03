import { Box, Heading, Stack, Link, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";

export default function FooterSection() {
  return (
    <Box
      py={16}
      px={10}
      bg={useColorModeValue("gray.100", "gray.800")}
      textAlign="center"
      borderTop="1px solid"
      borderColor={useColorModeValue("gray.300", "gray.700")}
    >
      <Heading size="lg" mb={8} color="teal.600">
        Contact Us
      </Heading>

      <Stack spacing={6} align="center" fontSize="lg">
        <Link
          href="mailto:your-email@example.com"
          isExternal
          color="teal.500"
          _hover={{ color: "teal.700", textDecoration: "underline" }}
        >
          <Icon as={FaEnvelope} boxSize={6} mr={2} />
          officialtesting@gmail.com
        </Link>

        <Link
          href="https://github.com/prernapreyshi/ShareMyRide"
          isExternal
          color="teal.500"
          _hover={{ color: "teal.700", textDecoration: "underline" }}
        >
          <Icon as={FaGithub} boxSize={6} mr={2} />
          github.com/your-github
        </Link>
      </Stack>

      
    </Box>
  );
}
