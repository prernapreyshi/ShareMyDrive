import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Button,
  Spinner,
  useToast,
  Select,
  SimpleGrid,
  Text,
  Badge,
} from "@chakra-ui/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const EditProfile = () => {
  const { role } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "",

    vehicleInfo: "",
    licensePlate: "",
    driverLicenseNumber: "",
    licenseExpiry: "",
    aadharNumber: "",

    isVerified: false,
    verificationStatus: "pending",
  });

  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!auth.currentUser || !role) return;

        const collectionName = role === "driver" ? "drivers" : "riders";
        const ref = doc(db, collectionName, auth.currentUser.uid);

        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
          setFormData((prev) => ({
            ...prev,
            ...docSnap.data(),
            email: auth.currentUser.email || "",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            email: auth.currentUser.email || "",
          }));
        }
      } catch (err) {
        toast({
          title: "Error loading profile",
          description: err.message,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [role, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const collectionName = role === "driver" ? "drivers" : "riders";
      const ref = doc(db, collectionName, auth.currentUser.uid);

      await updateDoc(ref, formData);

      toast({
        title: "Profile updated successfully",
        status: "success",
      });

      navigate(role === "driver" ? "/driver-dashboard" : "/rider-dashboard");
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.message,
        status: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxW="900px" mx="auto">
      <Heading mb={6}>Edit Profile</Heading>

      <Box mb={6}>
        <Text mb={2}>Verification Status</Text>
        <Badge colorScheme={formData.isVerified ? "green" : "yellow"}>
          {formData.isVerified ? "Verified" : formData.verificationStatus}
        </Badge>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl>
          <FormLabel>Full Name</FormLabel>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input value={formData.email} isReadOnly />
        </FormControl>

        <FormControl>
          <FormLabel>Phone</FormLabel>
          <Input name="phone" value={formData.phone} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Date of Birth</FormLabel>
          <Input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Gender</FormLabel>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Blood Group</FormLabel>
          <Select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>O+</option>
            <option>O-</option>
            <option>AB+</option>
            <option>AB-</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Emergency Contact</FormLabel>
          <Input
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
          />
        </FormControl>

        {role === "driver" && (
          <>
            <FormControl>
              <FormLabel>Vehicle Info</FormLabel>
              <Input
                name="vehicleInfo"
                value={formData.vehicleInfo}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>License Plate</FormLabel>
              <Input
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Driver License Number</FormLabel>
              <Input
                name="driverLicenseNumber"
                value={formData.driverLicenseNumber}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>License Expiry</FormLabel>
              <Input
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Aadhaar Number</FormLabel>
              <Input
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
              />
            </FormControl>
          </>
        )}

        {role === "rider" && (
          <FormControl>
            <FormLabel>Aadhaar Number</FormLabel>
            <Input
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
            />
          </FormControl>
        )}
      </SimpleGrid>

      <Button
        mt={8}
        width="full"
        colorScheme="teal"
        size="lg"
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default EditProfile;