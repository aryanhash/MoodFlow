import { useState } from 'react';
import MoodDetectionModal from '../MoodDetectionModal';
import { Button } from '@/components/ui/button';

export default function MoodDetectionModalExample() {
  const [open, setOpen] = useState(false);
  const [webcamConsent, setWebcamConsent] = useState(true);
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <MoodDetectionModal
        open={open}
        onClose={() => setOpen(false)}
        onDetect={(text, useWebcam) => console.log('Detected:', text, useWebcam)}
        webcamConsent={webcamConsent}
        onWebcamConsentChange={setWebcamConsent}
      />
    </div>
  );
}
