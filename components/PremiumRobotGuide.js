import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import {useVoiceAI} from './UseVoiceAI';
import {VoiceControlInterface} from './VoiceControlInterface';

// Custom EllipseGeometry class
class EllipseGeometry extends THREE.BufferGeometry {
  constructor(radiusX = 1, radiusY = 0.5, segments = 32) {
    super();
    
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    
    // Center vertex
    vertices.push(0, 0, 0);
    normals.push(0, 0, 1);
    uvs.push(0.5, 0.5);
    
    // Create ellipse vertices
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      
      vertices.push(x, y, 0);
      normals.push(0, 0, 1);
      uvs.push((x / radiusX + 1) / 2, (y / radiusY + 1) / 2);
      
      if (i < segments) {
        indices.push(0, i + 1, i + 2);
      }
    }
    
    this.setIndex(indices);
    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  }
}

// Extend R3F to recognize our custom geometry
extend({ EllipseGeometry });

// Enhanced Background with floating particles
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 150;
  
  const positions = React.useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00E5FF"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Mobile-Optimized Camera Controls
// Mobile-Optimized Camera Controls - Fixed for JS with proper scroll support
function CameraControls() {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [previousPosition, setPreviousPosition] = useState({ x: 0, y: 0 });
  const [cameraPosition, setCameraPosition] = useState({ theta: 0, phi: Math.PI / 2, radius: 8 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  const [touchIntention, setTouchIntention] = useState('unknown'); // 'scroll', 'rotate', or 'unknown'

  React.useEffect(() => {
    if (!gl?.domElement) return;

    const getEventPosition = (e) => {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const handleStart = (e) => {
      const pos = getEventPosition(e);
      setStartPosition(pos);
      setPreviousPosition(pos);
      setStartTime(Date.now());
      setTouchIntention('unknown');
      
      // Only immediately start dragging for mouse events
      if (e.type === 'mousedown') {
        e.preventDefault();
        setIsDragging(true);
      }
    };

    const handleMove = (e) => {
      const pos = getEventPosition(e);
      const deltaX = Math.abs(pos.x - startPosition.x);
      const deltaY = Math.abs(pos.y - startPosition.y);
      const timeElapsed = Date.now() - startTime;
      
      // For touch events, be very conservative about when to interfere with scroll
      if (e.touches) {
        if (touchIntention === 'unknown') {
          // Strong preference for allowing scroll - most gestures should scroll
          const isVerticalScroll = deltaY > deltaX * 2 && deltaY > 15;
          const isHorizontalRotate = deltaX > deltaY * 3 && deltaX > 30; // Much stricter threshold
          const hasSignificantMovement = deltaX > 35 || deltaY > 35;
          
          if (isVerticalScroll) {
            setTouchIntention('scroll');
            return; // Immediately allow scroll - don't prevent default
          }
          
          // Only intercept for very clear, deliberate horizontal rotation
          if (isHorizontalRotate && timeElapsed > 150) {
            setTouchIntention('rotate');
            e.preventDefault();
            setIsDragging(true);
          } else if (!hasSignificantMovement && timeElapsed < 300) {
            // Still determining intent - default to allowing scroll
            return;
          } else {
            // When in doubt, allow scroll
            setTouchIntention('scroll');
            return;
          }
        }
        
        // If we've determined this should be scroll, never interfere
        if (touchIntention === 'scroll') {
          return;
        }
      }

      // Only proceed with camera controls if we're actively dragging
      if (!isDragging) return;
      
      e.preventDefault();

      const moveDeltaX = pos.x - previousPosition.x;
      const moveDeltaY = pos.y - previousPosition.y;

      setCameraPosition(prev => ({
        ...prev,
        theta: prev.theta - moveDeltaX * 0.008,
        phi: Math.max(0.1, Math.min(Math.PI - 0.1, prev.phi + moveDeltaY * 0.008))
      }));

      setPreviousPosition(pos);
    };

    const handleEnd = () => {
      setIsDragging(false);
      setTouchIntention('unknown');
    };

    const handleWheel = (e) => {
      // Very conservative wheel handling - only intercept obvious zoom attempts
      const isZoomGesture = e.ctrlKey || e.metaKey; // Pinch-to-zoom on trackpad
      const isLargeWheelMovement = Math.abs(e.deltaY) > 120; // Large mouse wheel
      const isShiftHeld = e.shiftKey; // Horizontal scroll on some systems
      
      // Only prevent default for clear zoom intentions
      if ((isZoomGesture || isLargeWheelMovement) && !isShiftHeld) {
        e.preventDefault();
        setCameraPosition(prev => ({
          ...prev,
          radius: Math.max(6, Math.min(12, prev.radius + e.deltaY * 0.01))
        }));
      }
      // Let all other wheel events pass through (trackpad scroll, small wheel movements)
    };

    // Mouse events
    gl.domElement.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    
    // Touch events - use passive listeners to allow scroll by default
    gl.domElement.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd, { passive: true });
    
    // Wheel events - passive false only to check for zoom
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      gl.domElement.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      gl.domElement.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, previousPosition, startPosition, startTime, touchIntention, gl?.domElement]);

  useFrame(() => {
    const x = cameraPosition.radius * Math.sin(cameraPosition.phi) * Math.cos(cameraPosition.theta);
    const y = cameraPosition.radius * Math.cos(cameraPosition.phi);
    const z = cameraPosition.radius * Math.sin(cameraPosition.phi) * Math.sin(cameraPosition.theta);
    
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}


// Enhanced Interactive Responsive Robot with Ultra-Realistic Lip Sync
function CuteRobot({ voiceAI }) {
  const robotRef = useRef();
  const headRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const bodyRef = useRef();
  const armLeftRef = useRef();
  const armRightRef = useRef();
  const handLeftRef = useRef();
  const handRightRef = useRef();
  const antennaRef = useRef();
  const chestLightRef = useRef();
  
  // Enhanced mouth system refs
  const mouthRef = useRef();
  const upperLipRef = useRef();
  const lowerLipRef = useRef();
  const jawRef = useRef();
  const tongueRef = useRef();

  const [isWaving, setIsWaving] = useState(false);
  const [isExcited, setIsExcited] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(0);
  const [shouldBlink, setShouldBlink] = useState(false);
  const [eyeRotation, setEyeRotation] = useState({ left: 0, right: 0 });
  
  // Ultra-realistic lip sync state
  const [speechIntensity, setSpeechIntensity] = useState(0);
  const [mouthShape, setMouthShape] = useState('closed');
  const [speechPattern, setSpeechPattern] = useState([]);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [vowelIntensity, setVowelIntensity] = useState(0);
  const [consonantSharpness, setConsonantSharpness] = useState(0);
  const [speechBreath, setSpeechBreath] = useState(0);

  // Generate ultra-realistic speech patterns with phoneme timing
  useEffect(() => {
    if (voiceAI.isSpeaking) {
      // Create more sophisticated phoneme patterns with realistic timing
      const phonemeSequences = [
        // Vowel-heavy sequences (more open mouth)
        ['open', 'wide', 'open', 'small', 'open'],
        ['wide', 'open', 'wide', 'small'],
        ['small', 'open', 'small', 'wide'],
        
        // Consonant clusters (rapid mouth changes)
        ['closed', 'small', 'closed', 'wide'],
        ['closed', 'open', 'closed', 'small'],
        
        // Mixed realistic speech patterns
        ['open', 'closed', 'wide', 'small', 'closed', 'open'],
        ['small', 'wide', 'closed', 'open', 'small'],
        ['wide', 'closed', 'small', 'wide', 'open']
      ];
      
      // Build a longer, more realistic sequence
      const finalPattern = [];
      for (let i = 0; i < 8; i++) {
        const sequence = phonemeSequences[Math.floor(Math.random() * phonemeSequences.length)];
        finalPattern.push(...sequence);
        
        // Add natural pauses (closed mouth)
        if (Math.random() < 0.3) {
          finalPattern.push('closed', 'closed');
        }
      }
      
      setSpeechPattern(finalPattern);
      setSpeechIndex(0);
    } else {
      setMouthShape('closed');
      setSpeechIntensity(0);
      setVowelIntensity(0);
      setConsonantSharpness(0);
      setSpeechBreath(0);
    }
  }, [voiceAI.isSpeaking]);

  const handleInteraction = () => {
    const now = Date.now();
    setLastInteraction(now);
    
    setShouldBlink(true);
    setTimeout(() => setShouldBlink(false), 300);
    
    setEyeRotation({
      left: (Math.random() - 0.5) * 0.3,
      right: (Math.random() - 0.5) * 0.3
    });
    
    if (!isWaving && Math.random() > 0.3) {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2500);
    }
    
    setIsExcited(true);
    setTimeout(() => setIsExcited(false), 3000);
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const timeSinceInteraction = (Date.now() - lastInteraction) / 1000;
    const excitementLevel = Math.max(0, 1 - timeSinceInteraction / 5);
    
    const isListeningOrSpeaking = voiceAI.isListening || voiceAI.isSpeaking;
    
    // Ultra-realistic speech animation system
    if (voiceAI.isSpeaking && speechPattern.length > 0) {
      // Variable speech timing that mimics natural speech rhythm
      const baseSpeed = 2.5; // Much more realistic base speed
      const speechRhythm = Math.sin(time * 1.5) * 0.3 + Math.sin(time * 2.8) * 0.2;
      const emotionalSpeed = isExcited ? 1.3 : 1.0;
      const dynamicSpeed = baseSpeed * emotionalSpeed + speechRhythm;
      
      const newIndex = Math.floor(time * dynamicSpeed) % speechPattern.length;
      if (newIndex !== speechIndex) {
        setSpeechIndex(newIndex);
        setMouthShape(speechPattern[newIndex]);
      }
      
      // Multi-layered speech intensity
      const primaryIntensity = 0.4 + Math.sin(time * 3) * 0.2;
      const secondaryIntensity = Math.sin(time * 7) * 0.15;
      const microIntensity = Math.sin(time * 12) * 0.08;
      setSpeechIntensity(primaryIntensity + secondaryIntensity + microIntensity);
      
      // Vowel and consonant characteristics
      setVowelIntensity(Math.sin(time * 4) * 0.3 + 0.4);
      setConsonantSharpness(Math.sin(time * 8) * 0.2 + 0.3);
      setSpeechBreath(Math.sin(time * 2) * 0.1 + 0.2);
    }

    // Robot body animations with speech responsiveness
    if (robotRef.current) {
      const baseFloat = Math.sin(time * 1.8) * 0.08 + Math.sin(time * 3.2) * 0.02;
      const excitedFloat = isExcited ? Math.sin(time * 8) * 0.04 : 0;
      const voiceFloat = voiceAI.isSpeaking ? Math.sin(time * 15) * 0.03 : 0;
      const breathFloat = voiceAI.isSpeaking ? Math.sin(time * 6) * 0.015 : 0;
      
      robotRef.current.position.y = baseFloat + excitedFloat + voiceFloat + breathFloat;
      robotRef.current.rotation.y = Math.PI/2 + Math.sin(time * 0.5) * 0.03 + excitementLevel * 0.02;
    }

    // Enhanced head movement with speech expressiveness
    if (headRef.current) {
      const baseY = Math.sin(time * 1.2) * 0.15 + Math.sin(time * 2.8) * 0.05;
      const excitedY = isExcited ? Math.sin(time * 6) * 0.1 : 0;
      const voiceY = voiceAI.isListening ? Math.sin(time * 4) * 0.05 : 0;
      
      // Much more expressive head movement when speaking
      const speakingY = voiceAI.isSpeaking ? Math.sin(time * 5) * 0.12 : 0;
      const speakingTilt = voiceAI.isSpeaking ? Math.sin(time * 3.5) * 0.08 : 0;
      const speechEmphasis = voiceAI.isSpeaking ? Math.sin(time * 8) * 0.04 : 0;
      
      headRef.current.rotation.y = baseY + excitedY + voiceY + speakingY;
      headRef.current.rotation.z = Math.sin(time * 2.1) * 0.08 + speakingTilt;
      headRef.current.rotation.x = Math.sin(time * 1.5) * 0.06 + speechEmphasis;
    }

    // Ultra-realistic mouth animation system
    if (mouthRef.current) {
      if (voiceAI.isSpeaking) {
        const speechTime = time * 2.5; // Realistic speech timing
        const breathModifier = speechBreath * 0.5;
        
        switch (mouthShape) {
          case 'open':
            // Vowel sounds like "ah", "oh" - open and rounded with breath
            mouthRef.current.scale.y = 1.6 + Math.sin(speechTime * 1.2) * 0.3 + breathModifier;
            mouthRef.current.scale.x = 1.2 + Math.sin(speechTime * 0.8) * 0.2 + vowelIntensity * 0.1;
            mouthRef.current.rotation.z = Math.sin(speechTime * 0.4) * 0.04;
            mouthRef.current.position.y = -0.08 + Math.sin(speechTime * 1.5) * 0.012;
            break;
            
          case 'wide':
            // Sounds like "ee", "ay" - wide smile-like shape
            mouthRef.current.scale.y = 0.8 + Math.sin(speechTime * 1.8) * 0.2 + breathModifier * 0.3;
            mouthRef.current.scale.x = 1.8 + Math.sin(speechTime * 1.2) * 0.25 + vowelIntensity * 0.15;
            mouthRef.current.rotation.z = Math.sin(speechTime * 0.3) * 0.025;
            mouthRef.current.position.y = -0.12 + Math.sin(speechTime * 1.3) * 0.008;
            break;
            
          case 'small':
            // Sounds like "oo", "u" - small rounded mouth
            mouthRef.current.scale.y = 1.2 + Math.sin(speechTime * 1.5) * 0.2 + breathModifier * 0.4;
            mouthRef.current.scale.x = 0.7 + Math.sin(speechTime * 1.0) * 0.15 + consonantSharpness * 0.05;
            mouthRef.current.rotation.z = Math.sin(speechTime * 0.5) * 0.03;
            mouthRef.current.position.y = -0.09 + Math.sin(speechTime * 1.4) * 0.01;
            break;
            
          case 'closed':
          default:
            // Consonants - mouth nearly closed with micro-movements
            mouthRef.current.scale.y = 0.3 + Math.sin(speechTime * 2.0) * 0.1 + consonantSharpness * 0.05;
            mouthRef.current.scale.x = 1.0 + Math.sin(speechTime * 1.8) * 0.1;
            mouthRef.current.rotation.z = Math.sin(speechTime * 0.8) * 0.02;
            mouthRef.current.position.y = -0.11 + Math.sin(speechTime * 2.0) * 0.005;
            break;
        }
        
        // Add micro-expressions and speech texture
        mouthRef.current.position.x = Math.sin(speechTime * 0.7) * 0.004;
        mouthRef.current.rotation.x = Math.sin(speechTime * 1.1) * 0.015;
        
      } else {
        // Smooth return to neutral position
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.5, 0.06);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.0, 0.06);
        mouthRef.current.rotation.z = THREE.MathUtils.lerp(mouthRef.current.rotation.z, 0, 0.06);
        mouthRef.current.rotation.x = THREE.MathUtils.lerp(mouthRef.current.rotation.x, 0, 0.06);
        mouthRef.current.position.y = THREE.MathUtils.lerp(mouthRef.current.position.y, -0.1, 0.06);
        mouthRef.current.position.x = THREE.MathUtils.lerp(mouthRef.current.position.x, 0, 0.06);
      }
    }

    // Enhanced lip accents that respond to speech
    if (upperLipRef.current && lowerLipRef.current) {
      if (voiceAI.isSpeaking) {
        const lipTime = time * 3;
        
        // Upper lip follows speech patterns
        upperLipRef.current.scale.setScalar(0.9 + Math.sin(lipTime) * 0.1 + vowelIntensity * 0.05);
        upperLipRef.current.material.emissiveIntensity = 0.1 + speechIntensity * 0.1;
        
        // Lower lip has slightly different timing
        lowerLipRef.current.scale.setScalar(0.9 + Math.sin(lipTime * 1.2) * 0.08 + consonantSharpness * 0.04);
        lowerLipRef.current.material.emissiveIntensity = 0.1 + speechIntensity * 0.08;
      } else {
        // Return to neutral
        upperLipRef.current.scale.setScalar(THREE.MathUtils.lerp(upperLipRef.current.scale.x, 0.9, 0.05));
        lowerLipRef.current.scale.setScalar(THREE.MathUtils.lerp(lowerLipRef.current.scale.x, 0.9, 0.05));
        upperLipRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(upperLipRef.current.material.emissiveIntensity, 0.1, 0.05);
        lowerLipRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(lowerLipRef.current.material.emissiveIntensity, 0.1, 0.05);
      }
    }

    // Enhanced eye animations with speech awareness
    if (eyeLeftRef.current && eyeRightRef.current) {
      let blink = 1;
      
      if (shouldBlink || voiceAI.isListening) {
        blink = 0.1;
      } else if (Math.floor(time * 0.3) % 20 === 0 && Math.sin(time * 10) > 0.95) {
        blink = 0.2;
      }
      
      // More expressive blinking when speaking with micro-expressions
      if (voiceAI.isSpeaking) {
        if (Math.sin(time * 6) > 0.9) {
          blink = 0.6 + Math.sin(time * 20) * 0.1; // Varied blink intensity
        }
      }
      
      eyeLeftRef.current.scale.y = blink;
      eyeRightRef.current.scale.y = blink;
      
      // Eyes express emotion during speech
      const speakingLook = voiceAI.isSpeaking ? Math.sin(time * 2.5) * 0.08 : 0;
      const emotionalLook = isExcited ? Math.sin(time * 4) * 0.05 : 0;
      
      eyeLeftRef.current.rotation.y = eyeRotation.left + Math.sin(time * 0.8) * 0.1 + speakingLook + emotionalLook;
      eyeRightRef.current.rotation.y = eyeRotation.right + Math.sin(time * 0.8) * 0.1 + speakingLook + emotionalLook;
      
      const baseGlow = 0.6 + Math.sin(time * 4) * 0.2;
      const excitedGlow = isExcited ? 0.4 : 0;
      const voiceGlow = isListeningOrSpeaking ? 0.3 : 0;
      const speechGlow = voiceAI.isSpeaking ? Math.sin(time * 8) * 0.1 : 0;
      
      eyeLeftRef.current.material.emissiveIntensity = baseGlow + excitedGlow + voiceGlow + speechGlow;
      eyeRightRef.current.material.emissiveIntensity = baseGlow + excitedGlow + voiceGlow + speechGlow;
    }

    // Rest of the animations remain the same but with enhanced speech responsiveness
    if (chestLightRef.current) {
      const baseBreathe = 0.3 + Math.sin(time * 2.5) * 0.2;
      const excitedBreathe = isExcited ? Math.sin(time * 8) * 0.3 : 0;
      const voiceBreathe = voiceAI.isSpeaking ? Math.sin(time * 10) * 0.4 + speechIntensity * 0.2 : 
                          voiceAI.isListening ? Math.sin(time * 6) * 0.2 : 0;
      chestLightRef.current.material.emissiveIntensity = baseBreathe + excitedBreathe + voiceBreathe;
    }

    if (bodyRef.current) {
      const baseBreathe = 1 + Math.sin(time * 2.8) * 0.015;
      const excitedBreathe = isExcited ? Math.sin(time * 6) * 0.01 : 0;
      const voiceBreathe = isListeningOrSpeaking ? Math.sin(time * 4) * 0.005 : 0;
      const speechBreathe = voiceAI.isSpeaking ? Math.sin(time * 12) * 0.008 + speechBreath * 0.005 : 0;
      
      bodyRef.current.scale.setScalar(baseBreathe + excitedBreathe + voiceBreathe + speechBreathe);
    }

    // Enhanced arm movements with speech gestures
    if (armLeftRef.current && armRightRef.current && handLeftRef.current && handRightRef.current) {
      if (isWaving) {
        armRightRef.current.rotation.z = -0.8;
        armRightRef.current.rotation.x = -0.3;
        handRightRef.current.rotation.z = Math.sin(time * 12) * 0.8;
        handRightRef.current.rotation.x = Math.sin(time * 10) * 0.3;
        
        armLeftRef.current.rotation.z = 0.3 + Math.sin(time * 2) * 0.05;
        armLeftRef.current.rotation.x = Math.sin(time * 1.5) * 0.05;
        handLeftRef.current.rotation.z = Math.sin(time * 2) * 0.05;
        handLeftRef.current.rotation.x = Math.sin(time * 1.8) * 0.03;
      } else {
        const excitedMovement = isExcited ? 0.05 : 0;
        const voiceMovement = isListeningOrSpeaking ? 0.03 : 0;
        
        // Much more expressive arm gestures when speaking
        const speakingGestureLeft = voiceAI.isSpeaking ? Math.sin(time * 4) * 0.15 + Math.sin(time * 7) * 0.08 : 0;
        const speakingGestureRight = voiceAI.isSpeaking ? Math.sin(time * 5) * 0.12 + Math.cos(time * 6) * 0.06 : 0;
        
        armLeftRef.current.rotation.z = 0.3 + Math.sin(time * 1.8) * (0.1 + excitedMovement + voiceMovement) + speakingGestureLeft;
        armRightRef.current.rotation.z = -0.3 + Math.sin(time * 2.2) * (0.1 + excitedMovement + voiceMovement) + speakingGestureRight;
        armLeftRef.current.rotation.x = Math.sin(time * 1.5) * 0.08 + (voiceAI.isSpeaking ? Math.sin(time * 8) * 0.05 : 0);
        armRightRef.current.rotation.x = Math.sin(time * 1.3) * 0.08 + (voiceAI.isSpeaking ? Math.cos(time * 9) * 0.04 : 0);
        
        // Hand expressions during speech
        const handGestureIntensity = voiceAI.isSpeaking ? speechIntensity * 0.3 : 0;
        
        handLeftRef.current.rotation.z = Math.sin(time * 2.5) * 0.1 + handGestureIntensity;
        handRightRef.current.rotation.z = Math.sin(time * 2.8) * 0.1 + handGestureIntensity;
        handLeftRef.current.rotation.x = Math.sin(time * 2) * 0.05 + (voiceAI.isSpeaking ? Math.sin(time * 10) * 0.03 : 0);
        handRightRef.current.rotation.x = Math.sin(time * 2.3) * 0.05 + (voiceAI.isSpeaking ? Math.cos(time * 11) * 0.025 : 0);
      }
    }

    if (antennaRef.current) {
      const baseMovement = Math.sin(time * 2.5) * 0.1;
      const excitedMovement = isExcited ? Math.sin(time * 12) * 0.15 : 0;
      const voiceMovement = voiceAI.isListening ? Math.sin(time * 8) * 0.1 : 
                          voiceAI.isSpeaking ? Math.sin(time * 6) * 0.08 + speechIntensity * 0.05 : 0;
      antennaRef.current.rotation.z = baseMovement + excitedMovement + voiceMovement;
      antennaRef.current.rotation.x = Math.sin(time * 1.8) * 0.05;
    }

    if (Math.random() < 0.0003 && !isWaving && timeSinceInteraction > 15) {
      handleInteraction();
    }
  });

  return (
    <group ref={robotRef} onClick={handleInteraction} onPointerDown={handleInteraction}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.9, 1.4, 20]} />
        <meshStandardMaterial 
          color="#F5F7FA" 
          metalness={0.4} 
          roughness={0.1}
          emissive="#F5F7FA"
          emissiveIntensity={0.1}
        />
      </mesh>

      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.08, 20]} />
        <meshStandardMaterial 
          color="#00B4D8" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#00B4D8"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.82, 0.82, 0.08, 20]} />
        <meshStandardMaterial 
          color="#FFBE0B" 
          metalness={0.7} 
          roughness={0.2}
          emissive="#FFBE0B"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh ref={chestLightRef} position={[0, 0.2, 0.72]}>
        <circleGeometry args={[0.18]} />
        <meshStandardMaterial 
          color="#00B4D8" 
          emissive="#00B4D8"
          emissiveIntensity={0.6}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.9, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial 
            color="#F5F7FA" 
            metalness={0.2} 
            roughness={0.05}
            emissive="#F5F7FA"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Eyes */}
        <mesh ref={eyeLeftRef} position={[-0.18, 0.12, 0.45]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial 
            color="#00B4D8" 
            emissive="#00B4D8"
            emissiveIntensity={1.2}
            metalness={0.4}
            roughness={0.1}
          />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.18, 0.12, 0.45]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial 
            color="#00B4D8" 
            emissive="#00B4D8"
            emissiveIntensity={1.2}
            metalness={0.4}
            roughness={0.1}
          />
        </mesh>

        <mesh position={[-0.16, 0.15, 0.49]}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.20, 0.15, 0.49]}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            emissive="#FFFFFF"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Enhanced Mouth System */}
        <mesh ref={mouthRef} position={[0, -0.1, 0.52]}>
          <ellipseGeometry args={[0.15, 0.06, 32]} />
          <meshStandardMaterial 
            color="#0F172A" 
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>

        {/* Enhanced lip accents with speech responsiveness */}
        <mesh ref={upperLipRef} position={[0, -0.08, 0.515]} rotation={[0, 0, Math.PI]} scale={[0.9, 0.9, 0.9]}>
          <torusGeometry args={[0.12, 0.006, 8, 16, Math.PI]} />
          <meshStandardMaterial 
            color="#00B4D8" 
            emissive="#00B4D8"
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh ref={lowerLipRef} position={[0, -0.12, 0.515]} scale={[0.9, 0.9, 0.9]}>
          <torusGeometry args={[0.12, 0.006, 8, 16, Math.PI]} />
          <meshStandardMaterial 
            color="#00B4D8" 
            emissive="#00B4D8"
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Antenna */}
        <group ref={antennaRef} position={[0, 0.55, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.35]} />
            <meshStandardMaterial 
              color="#E2E8F0" 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color="#FFBE0B" 
              emissive="#FFBE0B"
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.1}
            />
          </mesh>
        </group>
      </group>

      {/* Arms */}
      <group ref={armLeftRef} position={[-0.8, 0.2, 0]} rotation={[0, 0, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.9]} />
          <meshStandardMaterial 
            color="#F5F7FA" 
            metalness={0.8} 
            roughness={0.15}
            emissive="#F5F7FA"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.11]} />
          <meshStandardMaterial 
            color="#00B4D8" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#00B4D8"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
      
      <group ref={armRightRef} position={[0.8, 0.2, 0]} rotation={[0, 0, -0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.9]} />
          <meshStandardMaterial 
            color="#F5F7FA" 
            metalness={0.8} 
            roughness={0.15}
            emissive="#F5F7FA"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.11]} />
          <meshStandardMaterial 
            color="#00B4D8" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#00B4D8"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* Hands */}
      <mesh ref={handLeftRef} position={[-1.05, -0.35, 0]} castShadow>
        <sphereGeometry args={[0.14]} />
        <meshStandardMaterial 
          color="#00B4D8" 
          metalness={0.8} 
          roughness={0.15}
          emissive="#00B4D8"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh ref={handRightRef} position={[1.05, -0.35, 0]} castShadow>
        <sphereGeometry args={[0.14]} />
        <meshStandardMaterial 
          color="#00B4D8" 
          metalness={0.8} 
          roughness={0.15}
          emissive="#00B4D8"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Base */}
      <mesh position={[0, -1.2, 0]} castShadow>
        <cylinderGeometry args={[0.9, 0.7, 0.4, 20]} />
        <meshStandardMaterial 
          color="#F5F7FA" 
          metalness={0.5} 
          roughness={0.2}
          emissive="#F5F7FA"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.92, 0.72, 0.1, 20]} />
        <meshStandardMaterial 
          color="#FFBE0B" 
          emissive="#FFBE0B"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Enhanced Lighting System
function SceneLighting() {
  const lightRef = useRef();
  const spotRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (lightRef.current) {
      lightRef.current.intensity = 0.6 + Math.sin(time * 2) * 0.1;
      lightRef.current.color.setHSL(0.55, 0.8, 0.6);
    }
    
    if (spotRef.current) {
      spotRef.current.position.x = Math.sin(time * 0.3) * 2;
      spotRef.current.position.z = Math.cos(time * 0.3) * 2;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.7} color="#F5F7FA" />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#F5F7FA"
      />
      <pointLight ref={lightRef} position={[-4, 3, 4]} intensity={0.8} color="#00B4D8" />
      <pointLight position={[4, 3, 4]} intensity={0.6} color="#FFBE0B" />
      <pointLight position={[0, -2, 0]} intensity={0.4} color="#00B4D8" />
      <spotLight 
        ref={spotRef}
        position={[0, 8, -5]} 
        intensity={0.8} 
        angle={Math.PI / 3}
        penumbra={0.5}
        color="#00B4D8"
        castShadow
      />
      {/* Rim lighting */}
      <directionalLight
        position={[-5, 2, -5]}
        intensity={0.5}
        color="#FFBE0B"
      />
    </>
  );
}

export default function WebboticaRobot() {
  const [currentTime, setCurrentTime] = useState('');
  const voiceAI = useVoiceAI();

  useEffect(() => { 
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Meaningful Brand Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 15% 15%, rgba(0, 180, 216, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(255, 190, 11, 0.12) 0%, transparent 35%),
            radial-gradient(circle at 50% 20%, rgba(0, 180, 216, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(255, 190, 11, 0.06) 0%, transparent 45%),
            linear-gradient(135deg, #1E2A38 0%, #243240 25%, #1E2A38 50%, #2A3A48 75%, #1E2A38 100%)
          `
        }}
      />
      
      {/* Business Growth Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent 0px,
              transparent 60px,
              rgba(0, 180, 216, 0.03) 60px,
              rgba(0, 180, 216, 0.03) 120px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent 0px,
              transparent 80px,
              rgba(255, 190, 11, 0.02) 80px,
              rgba(255, 190, 11, 0.02) 160px
            )
          `,
          animation: 'businessFlow 20s ease-in-out infinite'
        }}
      />
      {/* Minimalist Premium Lead to Loyalty Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(0, 180, 216, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 190, 11, 0.06) 0%, transparent 45%),
            linear-gradient(135deg, #0A0F1C 0%, #1A1B2E 25%, #16213E 50%, #0F172A 75%, #020617 100%)
          `
        }}
      />

      {/* Clean, Premium Typography */}
      <div className="absolute inset-0 z-0 flex items-start justify-center pt-24 pointer-events-none">
        <div className="text-center">
          {/* LEAD */}
          <div 
            className="font-light tracking-[0.8em] mb-6"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              background: "linear-gradient(90deg, #00E5FF70 0%, #00B4D850 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 0.25,
              letterSpacing: "0.8em"
            }}
          >
            LEAD
          </div>
          
          {/* Elegant connecting line */}
          <div className="flex items-center justify-center my-8">
            <div 
              className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: "elegantFlow 6s ease-in-out infinite"
              }}
            />
            <div 
              className="mx-6 w-2 h-2 rounded-full bg-white/15 animate-pulse"
              style={{
                boxShadow: "0 0 8px rgba(255, 255, 255, 0.1)"
              }}
            />
            <div 
              className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: "elegantFlow 6s ease-in-out infinite reverse"
              }}
            />
          </div>
          
          {/* LOYALTY */}
          <div 
            className="font-light tracking-[0.8em]"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              background: "linear-gradient(90deg, #FFBE0B70 0%, #FCD34D50 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 0.25,
              letterSpacing: "0.8em"
            }}
          >
            LOYALTY
          </div>
        </div>
      </div>

      {/* Minimal Corner Accents */}
      <div className="absolute top-20 left-6 z-0 opacity-15">
        <div className="w-8 h-px bg-gradient-to-r from-cyan-400/40 to-transparent"></div>
      </div>

      <div className="absolute top-20 right-6 z-0 opacity-15">
        <div className="w-8 h-px bg-gradient-to-l from-amber-400/40 to-transparent"></div>
      </div>

      {/* Subtle floating dots */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-10"
            style={{
              left: `${25 + i * 25}%`,
              top: `${40 + i * 10}%`,
              background: i % 2 === 0 ? "#00E5FF" : "#FFBE0B",
              animation: `minimalFloat ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Visible Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Geometric shapes representing the journey */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-15"
            style={{
              left: `${10 + (i % 4) * 25}%`,
              top: `${25 + Math.floor(i / 4) * 40}%`,
              animation: `organicFloat ${12 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
              transform: `rotate(${i * 45}deg)`
            }}
          >
            {i % 3 === 0 ? (
              // Hexagon for leads/connections
              <div
                className="w-16 h-16"
                style={{
                  background: "linear-gradient(135deg, #00E5FF25 0%, #00B4D815 50%, transparent 100%)",
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  border: "1px solid rgba(0, 229, 255, 0.2)",
                  boxShadow: "0 0 15px rgba(0, 229, 255, 0.1)"
                }}
              />
            ) : i % 3 === 1 ? (
              // Circle for transformation/process
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: "radial-gradient(circle, #FFBE0B20 0%, #F59E0B15 50%, transparent 70%)",
                  border: "1px solid rgba(255, 190, 11, 0.15)",
                  boxShadow: "0 0 12px rgba(255, 190, 11, 0.08)"
                }}
              />
            ) : (
              // Triangle for growth/loyalty
              <div
                className="w-14 h-14"
                style={{
                  background: "linear-gradient(135deg, #FCD34D20 0%, #FFBE0B15 50%, transparent 100%)",
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  border: "1px solid rgba(252, 211, 77, 0.15)",
                  boxShadow: "0 0 12px rgba(252, 211, 77, 0.08)"
                }}
              />
            )}
          </div>
        ))}
      </div>

   
  
      {/* Corner Accent Elements */}
      <div className="absolute top-20 left-6 z-0 opacity-30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400/50 animate-pulse" style={{ boxShadow: "0 0 8px rgba(0, 229, 255, 0.3)" }}></div>
          <div className="h-px w-12 bg-gradient-to-r from-cyan-400/40 to-transparent"></div>
        </div>
      </div>

      <div className="absolute top-20 right-6 z-0 opacity-30">
        <div className="flex items-center space-x-2">
          <div className="h-px w-12 bg-gradient-to-l from-amber-400/40 to-transparent"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400/50 animate-pulse" style={{ boxShadow: "0 0 8px rgba(255, 190, 11, 0.3)" }}></div>
        </div>
      </div>

      {/* Mobile Phone Pattern Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Phone Icons scattered in background */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-8"
            style={{
              left: `${15 + (i % 4) * 20}%`,
              top: `${20 + Math.floor(i / 4) * 25}%`,
              animation: `phoneFloat ${8 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              transform: `rotate(${(i % 3 - 1) * 15}deg)`
            }}
          >
            <div
              className="w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center"
              style={{
                borderColor: i % 3 === 0 ? "#00B4D840" : i % 3 === 1 ? "#FFBE0B40" : "#FCD34D40",
                background: `linear-gradient(135deg, ${
                  i % 3 === 0 ? "#00B4D810" : i % 3 === 1 ? "#FFBE0B10" : "#FCD34D10"
                } 0%, transparent 100%)`,
                backdropFilter: "blur(2px)"
              }}
            >
              {/* Phone screen */}
              <div
                className="w-10 h-16 rounded-sm"
                style={{
                  background: `linear-gradient(180deg, ${
                    i % 3 === 0 ? "#00B4D820" : i % 3 === 1 ? "#FFBE0B20" : "#FCD34D20"
                  } 0%, transparent 100%)`
                }}
              />
              {/* Home button */}
              <div
                className="w-2 h-2 rounded-full mt-1"
                style={{
                  background: i % 3 === 0 ? "#00B4D840" : i % 3 === 1 ? "#FFBE0B40" : "#FCD34D40"
                }}
              />
            </div>
          </div>
        ))}
      </div>

   

      {/* Corner Journey Indicators - Mobile Style */}
      <div className="absolute top-4 left-4 z-0 opacity-20">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-xs text-cyan-400 font-medium">LEAD</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-xs text-blue-400 font-medium opacity-80">ENGAGE</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-0 opacity-20">
        <div className="flex flex-col space-y-2 items-end">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-amber-400 font-medium">CONVERT</span>
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-yellow-400 font-medium opacity-80">LOYALTY</span>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          </div>
        </div>
      </div>

      {/* Bottom Mobile Stats */}
      <div className="absolute bottom-20 left-4 right-4 z-0 opacity-15">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-400">95%</div>
            <div className="text-xs text-white/60">Mobile Reach</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">3.2s</div>
            <div className="text-xs text-white/60">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">24/7</div>
            <div className="text-xs text-white/60">Available</div>
          </div>
        </div>
      </div>
   

<Canvas 
  camera={{ position: [0, 1, 8], fov: 60 }}
  shadows
  gl={{ 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  }}
  style={{ 
    cursor: 'grab',
    touchAction: 'pan-y' // Allow vertical scrolling but handle horizontal ourselves
  }}
>
  <Suspense fallback={null}>
    <SceneLighting />
    <CuteRobot voiceAI={voiceAI} />
    <FloatingParticles />
    <CameraControls />
    
    {/* Enhanced ground with reflections */}
    <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[12]} />
      <meshStandardMaterial 
        color="#1E293B" 
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
    
    {/* Glowing ring around robot */}
    <mesh position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2, 2.2, 64]} />
      <meshStandardMaterial 
        color="#00E5FF" 
        emissive="#00E5FF"
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  </Suspense>
</Canvas>



      {/* Voice Control Interface - Properly positioned below robot on desktop */}
      <div className="absolute bottom-25 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4">
        <VoiceControlInterface 
          voiceAI={voiceAI}
          className="w-full"
        />
      </div>
      

      
  

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
          25% { transform: translateX(100%) translateY(-100%) rotate(90deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(180deg); }
          75% { transform: translateX(-100%) translateY(100%) rotate(270deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.2; }
          25% { transform: translateY(-20px) scale(1.05); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.4; }
          75% { transform: translateY(-20px) scale(1.05); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}