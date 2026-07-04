import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Heading, Text, VStack, Button, useToast, Tabs, TabList, TabPanels, Tab,
  TabPanel, HStack, Badge, Input, SimpleGrid, Stat, StatLabel, StatNumber,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Textarea, Select, Skeleton, Divider
} from '@chakra-ui/react';
import { db, auth } from '../firebase/firebaseConfig';
import {
  collection, onSnapshot, updateDoc, doc, serverTimestamp, getDoc
} from 'firebase/firestore';

const calcFare = (ride) => ride?.fare || (50 + Number(ride?.distance || 0) * 12);

export default function AvailableRideRequests() {
  const toast = useToast();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [riderDetails, setRiderDetails] = useState(null);
  const [reason, setReason] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState('5');

  const details = useDisclosure();
  const rejectModal = useDisclosure();
  const cancelModal = useDisclosure();
  const paymentModal = useDisclosure();
  const reviewModal = useDisclosure();
  const driverId = auth.currentUser?.uid;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'rideRequests'),
      (snap) => {
        setRides(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        toast({ title: 'Error fetching rides', description: err.message, status: 'error' });
        setLoading(false);
      }
    );
    return () => unsub();
  }, [toast]);

  const fetchRiderDetails = async (ride) => {
    try {
      if (!ride?.riderId) {
        setRiderDetails(null);
        return;
      }
      const snap = await getDoc(doc(db, 'users', ride.riderId));
      setRiderDetails(snap.exists() ? snap.data() : null);
    } catch {
      setRiderDetails(null);
    }
  };

  const filtered = useMemo(() => rides.filter((r) => {
    const q = search.toLowerCase();
    return !q || `${r.pickupLocation || ''} ${r.dropoffLocation || ''}`.toLowerCase().includes(q);
  }), [rides, search]);

  const pending = filtered.filter((r) => r.status === 'pending');
  const active = filtered.filter((r) => r.driverId === driverId && ['accepted', 'in_progress', 'payment_pending'].includes(r.status));
  const history = filtered.filter((r) => r.driverId === driverId && ['completed', 'cancelled', 'rejected'].includes(r.status));

  const stats = {
    pending: pending.length,
    active: active.length,
    completed: history.filter((r) => r.status === 'completed').length,
    todayEarnings: history.filter((r) => r.status === 'completed').reduce((a, b) => a + Number(b.fare || 0), 0),
    cashPending: active.filter((r) => r.status === 'payment_pending').reduce((a, b) => a + Number(b.fare || 0), 0),
  };

  const updateRide = async (ride, data, msg) => {
    try {
      await updateDoc(doc(db, 'rideRequests', ride.id), data);
      toast({ title: msg, status: 'success' });
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, status: 'error' });
    }
  };

  const RideCard = ({ ride }) => (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='sm'>
      <HStack justify='space-between'>
        <Heading size='sm'>{ride.pickupLocation} → {ride.dropoffLocation}</Heading>
        <Badge colorScheme={ride.status === 'completed' ? 'green' : ride.status === 'pending' ? 'yellow' : 'blue'}>{ride.status}</Badge>
      </HStack>
      <Text mt={2}>Date: {ride.date || '-'} | Time: {ride.time || '-'}</Text>
      <Text>Distance: {ride.distance || 0} km</Text>
      <Text>Duration: {ride.duration || 0} mins</Text>
      <Text>Fare: ₹{calcFare(ride)}</Text>
      {ride.cashReceived && <Text>Cash Received: ₹{ride.cashReceived}</Text>}
      <HStack mt={3} wrap='wrap'>
        {ride.status === 'pending' && <>
          <Button colorScheme='green' onClick={() => updateRide(ride, { status: 'accepted', driverId, acceptedAt: serverTimestamp() }, 'Ride accepted')}>Accept</Button>
          <Button colorScheme='red' onClick={() => { setSelectedRide(ride); rejectModal.onOpen(); }}>Reject</Button>
        </>}
        {ride.status === 'accepted' && <>
          <Button colorScheme='blue' onClick={() => updateRide(ride, { status: 'in_progress', startedAt: serverTimestamp() }, 'Ride started')}>Start Ride</Button>
          <Button colorScheme='red' onClick={() => { setSelectedRide(ride); cancelModal.onOpen(); }}>Cancel</Button>
        </>}
        {ride.status === 'in_progress' && (
          <Button colorScheme='orange' onClick={() => updateRide(ride, { status: 'payment_pending', completedAt: serverTimestamp(), paymentMode: 'cash', paymentStatus: 'pending', fare: calcFare(ride) }, 'Ride ended')}>End Ride</Button>
        )}
        {ride.status === 'payment_pending' && (
          <Button colorScheme='teal' onClick={() => { setSelectedRide(ride); setCashReceived(String(calcFare(ride))); paymentModal.onOpen(); }}>Collect Payment</Button>
        )}
        {ride.status === 'completed' && (
          <Button onClick={() => { setSelectedRide(ride); reviewModal.onOpen(); }}>Review Rider</Button>
        )}
        <Button variant='outline' onClick={async () => { setSelectedRide(ride); await fetchRiderDetails(ride); details.onOpen(); }}>Details</Button>
      </HStack>
    </Box>
  );

  if (loading) return <VStack p={6}><Skeleton h='120px' w='100%' /><Skeleton h='120px' w='100%' /></VStack>;

  return (
  <Box p={6}>
    <Tabs>
      <TabList>
        <Tab>Pending ({pending.length})</Tab>
        <Tab>Active ({active.length})</Tab>
        <Tab>History ({history.length})</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <VStack align="stretch">
            {pending.length ? (
              pending.map((r) => <RideCard key={r.id} ride={r} />)
            ) : (
              <Text>No ride requests available.</Text>
            )}
          </VStack>
        </TabPanel>

        <TabPanel>
          <VStack align="stretch">
            {active.length ? (
              active.map((r) => <RideCard key={r.id} ride={r} />)
            ) : (
              <Text>No active rides.</Text>
            )}
          </VStack>
        </TabPanel>

        <TabPanel>
          <VStack align="stretch">
            {history.length ? (
              history.map((r) => <RideCard key={r.id} ride={r} />)
            ) : (
              <Text>No ride history yet.</Text>
            )}
          </VStack>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <Modal isOpen={details.isOpen} onClose={details.onClose} size='xl'><ModalOverlay /><ModalContent><ModalHeader>Full Ride Details</ModalHeader><ModalBody>{selectedRide && <VStack align='start' spacing={3}><Heading size='sm'>Rider Details</Heading><Text><strong>Name:</strong> {riderDetails?.name || 'N/A'}</Text><Text><strong>Email:</strong> {riderDetails?.email || 'N/A'}</Text><Text><strong>Phone:</strong> {riderDetails?.phone || 'N/A'}</Text><Text><strong>Emergency Contact:</strong> {riderDetails?.emergencyContact || 'N/A'}</Text><Divider /><Heading size='sm'>Ride Details</Heading><Text><strong>Pickup:</strong> {selectedRide.pickupLocation}</Text><Text><strong>Dropoff:</strong> {selectedRide.dropoffLocation}</Text><Text><strong>Date:</strong> {selectedRide.date || 'N/A'}</Text><Text><strong>Time:</strong> {selectedRide.time || 'N/A'}</Text><Text><strong>Distance:</strong> {selectedRide.distance || 0} km</Text><Text><strong>Duration:</strong> {selectedRide.duration || 0} mins</Text><Text><strong>Fare:</strong> ₹{calcFare(selectedRide)}</Text><Text><strong>Status:</strong> {selectedRide.status}</Text><Text><strong>Payment Mode:</strong> {selectedRide.paymentMode || 'cash'}</Text><Text><strong>Payment Status:</strong> {selectedRide.paymentStatus || 'pending'}</Text></VStack>}</ModalBody><ModalFooter><Button onClick={details.onClose}>Close</Button></ModalFooter></ModalContent></Modal>
<Modal isOpen={rejectModal.isOpen} onClose={rejectModal.onClose}><ModalOverlay /><ModalContent><ModalHeader>Reject Ride</ModalHeader><ModalBody><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></ModalBody><ModalFooter><Button colorScheme='red' onClick={() => { updateRide(selectedRide, { status: 'rejected', rejectionReason: reason, rejectedAt: serverTimestamp() }, 'Ride rejected'); rejectModal.onClose(); }}>Reject</Button></ModalFooter></ModalContent></Modal>
<Modal isOpen={cancelModal.isOpen} onClose={cancelModal.onClose}><ModalOverlay /><ModalContent><ModalHeader>Cancel Ride</ModalHeader><ModalBody><Select value={reason} onChange={(e) => setReason(e.target.value)}><option>Rider not reachable</option><option>Rider no-show</option><option>Vehicle issue</option><option>Emergency</option></Select></ModalBody><ModalFooter><Button colorScheme='red' onClick={() => { updateRide(selectedRide, { status: 'cancelled', cancelReason: reason, cancelledBy: 'driver', cancelledAt: serverTimestamp() }, 'Ride cancelled'); cancelModal.onClose(); }}>Cancel Ride</Button></ModalFooter></ModalContent></Modal>
<Modal isOpen={paymentModal.isOpen} onClose={paymentModal.onClose}><ModalOverlay /><ModalContent><ModalHeader>Collect Cash Payment</ModalHeader><ModalBody>{selectedRide && <><Text>Fare: ₹{calcFare(selectedRide)}</Text><Input mt={3} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} /><Text mt={2}>Change: ₹{Math.max(0, Number(cashReceived || 0) - calcFare(selectedRide))}</Text></>}</ModalBody><ModalFooter><Button colorScheme='green' onClick={() => { if (Number(cashReceived) < calcFare(selectedRide)) return toast({ title: 'Received amount cannot be less than fare', status: 'error' }); updateRide(selectedRide, { cashReceived: Number(cashReceived), changeReturned: Number(cashReceived) - calcFare(selectedRide), paymentStatus: 'received', paymentReceivedAt: serverTimestamp(), status: 'completed' }, 'Payment received'); paymentModal.onClose(); }}>Confirm</Button></ModalFooter></ModalContent></Modal>
<Modal isOpen={reviewModal.isOpen} onClose={reviewModal.onClose}><ModalOverlay /><ModalContent><ModalHeader>Review Rider</ModalHeader><ModalBody><Select value={rating} onChange={(e) => setRating(e.target.value)}><option value='5'>5</option><option value='4'>4</option><option value='3'>3</option><option value='2'>2</option><option value='1'>1</option></Select><Textarea mt={3} value={review} onChange={(e) => setReview(e.target.value)} /></ModalBody><ModalFooter><Button onClick={() => { updateRide(selectedRide, { driverRating: Number(rating), driverReview: review, reviewedAt: serverTimestamp() }, 'Review submitted'); reviewModal.onClose(); }}>Submit</Button></ModalFooter></ModalContent></Modal></Box>);
}
