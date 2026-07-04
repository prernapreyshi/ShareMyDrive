import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
  VStack,
  SimpleGrid,
  Select,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DriverDetails = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    vehicleInfo: '',
    licensePlate: '',
    aadharNumber: '',
    driverLicenseNumber: '',
    licenseExpiry: '',
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhar: null,
    license: null,
    rc: null,
    insurance: null,
    pollution: null,
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const uploadFile = async (file, path) => {
    if (!file) return '';
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const basePath = `drivers/${user.uid}`;

      const [profilePhotoUrl, aadharUrl, licenseUrl, rcUrl, insuranceUrl, pollutionUrl] =
        await Promise.all([
          uploadFile(files.profilePhoto, `${basePath}/profilePhoto`),
          uploadFile(files.aadhar, `${basePath}/aadhar`),
          uploadFile(files.license, `${basePath}/license`),
          uploadFile(files.rc, `${basePath}/rc`),
          uploadFile(files.insurance, `${basePath}/insurance`),
          uploadFile(files.pollution, `${basePath}/pollution`),
        ]);

      await setDoc(doc(db, 'drivers', user.uid), {
        ...formData,
        email: user.email,
        profilePhotoUrl,
        aadharUrl,
        licenseUrl,
        rcUrl,
        insuranceUrl,
        pollutionUrl,
        isVerified: false,
        verificationStatus: 'pending',
        isOnline: false,
        createdAt: serverTimestamp(),
      });

      toast({ title: 'Profile submitted!', status: 'success', duration: 3000 });
      navigate('/driver-dashboard');
    } catch (error) {
      toast({ title: 'Something went wrong', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fileLabels = {
    profilePhoto: 'Profile Photo',
    aadhar: 'Aadhaar Card',
    license: 'Driving License',
    rc: 'Vehicle RC',
    insurance: 'Insurance Certificate',
    pollution: 'Pollution Certificate',
  };

  return (
    <Box maxW="900px" mx="auto" mt={10} p={8} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading mb={6}>Complete Driver Profile</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl>
          <FormLabel>Full Name</FormLabel>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Phone</FormLabel>
          <Input name="phone" value={formData.phone} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Date of Birth</FormLabel>
          <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input name="address" value={formData.address} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Emergency Contact</FormLabel>
          <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Blood Group</FormLabel>
          <Select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Vehicle Info</FormLabel>
          <Input name="vehicleInfo" value={formData.vehicleInfo} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>License Plate</FormLabel>
          <Input name="licensePlate" value={formData.licensePlate} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Aadhaar Number</FormLabel>
          <Input name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Driver License Number</FormLabel>
          <Input name="driverLicenseNumber" value={formData.driverLicenseNumber} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>License Expiry</FormLabel>
          <Input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} />
        </FormControl>
      </SimpleGrid>

      <VStack mt={8} spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">Upload Documents</Text>

        {Object.keys(fileLabels).map((key) => (
          <FormControl key={key}>
            <FormLabel>{fileLabels[key]}</FormLabel>
            <Input type="file" name={key} onChange={handleFileChange} accept="image/*,application/pdf" sx={{ pt: 1 }} />
          </FormControl>
        ))}

        <Button
          colorScheme="teal"
          size="lg"
          onClick={handleSubmit}
          isLoading={loading}
          loadingText="Uploading..."
          mt={2}
        >
          Submit
        </Button>
      </VStack>
    </Box>
  );
};

export default DriverDetails;