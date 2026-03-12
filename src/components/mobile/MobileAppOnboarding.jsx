import React, { useState } from 'react';
import MobileAppIntro1 from './MobileAppIntro1';
import MobileAppIntro2 from './MobileAppIntro2';
import MobileAppIntro3 from './MobileAppIntro3';

export default function MobileAppOnboarding() {
  const [step, setStep] = useState(0);

  const screens = [
    <MobileAppIntro1 key="1" onNext={() => setStep(1)} />,
    <MobileAppIntro2 key="2" onNext={() => setStep(2)} />,
    <MobileAppIntro3 key="3" />
  ];

  return screens[step];
}