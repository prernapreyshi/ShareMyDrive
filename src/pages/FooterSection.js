// src/Pages/FooterSection.js
import React, { useState } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Heading,
  Input,
  Textarea,
  Button,
  Icon,
  HStack,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiSend,
} from "react-icons/fi";

const FooterSection = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendMessage = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast({
        title: "Please fill all fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const mailtoLink = `mailto:sharemyride9@gmail.com?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}`
    )}`;

    window.location.href = mailtoLink;
  };

  return (
    <Box
      bg="linear-gradient(135deg, #020617 0%, #0f172a 100%)"
      color="white"
      pt={{ base: 20, md: 32 }}   // FIXED TOP SPACE
      pb={{ base: 16, md: 20 }}
      minH="100vh"
      w="100%"
    >
      <Container maxW="container.xl">
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: 12, md: 20 }}
          alignItems="center"
        >
          {/* Left */}
          <VStack align="start" spacing={8}>
            <Box>
              <Text
                color="teal.300"
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="3px"
              >
                CONTACT US
              </Text>

              <Heading
                mt={4}
                fontSize={{ base: "4xl", md: "6xl" }}
                lineHeight="1.1"
                maxW="600px"
              >
                Let’s build safer rides together.
              </Heading>

              <Text
                mt={6}
                color="gray.300"
                fontSize="xl"
                maxW="520px"
                lineHeight="1.6"
              >
                Have questions, feedback, or partnership ideas?
                Reach out to our team and we’ll get back to you quickly.
              </Text>
            </Box>

            <Stack spacing={5}>
              <HStack spacing={4}>
                <Icon as={FiMail} boxSize={6} color="teal.300" />
                <Text fontSize="lg">prernapreyshi2105@gmail.com</Text>
              </HStack>

              <HStack spacing={4}>
                <Icon as={FiPhone} boxSize={6} color="teal.300" />
                <Text fontSize="lg">+91 98765 43210</Text>
              </HStack>

              <HStack spacing={4}>
                <Icon as={FiMapPin} boxSize={6} color="teal.300" />
                <Text fontSize="lg">New Delhi, India</Text>
              </HStack>
            </Stack>

            <HStack spacing={5}>
              <Button
                leftIcon={<FiGithub />}
                variant="outline"
                colorScheme="teal"
                borderRadius="full"
                size="lg"
              >
                GitHub
              </Button>

              <Button
                leftIcon={<FiLinkedin />}
                variant="outline"
                colorScheme="teal"
                borderRadius="full"
                size="lg"
              >
                LinkedIn
              </Button>
            </HStack>
          </VStack>

          {/* Right */}
          <Box
            bg="white"
            p={{ base: 6, md: 10 }}
            borderRadius="3xl"
            boxShadow="dark-lg"
            w="100%"
          >
            <VStack spacing={5}>
              <Heading size="lg" color="gray.800" alignSelf="start">
                Send us a message
              </Heading>

              <Input
                name="name"
                placeholder="Your Full Name"
                size="lg"
                bg="gray.50"
                color="gray.800"
                value={formData.name}
                onChange={handleChange}
              />

              <Input
                name="email"
                placeholder="Your Email Address"
                size="lg"
                bg="gray.50"
                color="gray.800"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                name="subject"
                placeholder="Subject"
                size="lg"
                bg="gray.50"
                color="gray.800"
                value={formData.subject}
                onChange={handleChange}
              />

              <Textarea
                name="message"
                placeholder="Write your message..."
                rows={6}
                bg="gray.50"
                color="gray.800"
                value={formData.message}
                onChange={handleChange}
              />

              <Button
                colorScheme="teal"
                size="lg"
                width="full"
                borderRadius="xl"
                leftIcon={<FiSend />}
                onClick={handleSendMessage}
              >
                Send Message
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default FooterSection;