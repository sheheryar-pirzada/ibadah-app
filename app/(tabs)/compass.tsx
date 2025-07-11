import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Svg, { Circle, Line, Text as SvgText, Polygon } from 'react-native-svg';
import { useLocation } from '@/hooks/useLocation';

const { width } = Dimensions.get('window');
const compassSize = width * 0.8;
const center = compassSize / 2;

export default function TraditionalCompassScreen() {
  const { loc: location, qibla: qiblaDirection } = useLocation();
  const [heading, setHeading] = useState(0);
  const [calibrationAccuracy, setCalibrationAccuracy] = useState(1);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const magnetometerRef = useRef<any>(null);

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    magnetometerRef.current = Magnetometer.addListener(({ x, y, z }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      const smooth = (prev: number, next: number, alpha = 0.1) => {
        const delta = ((next - prev + 540) % 360) - 180;
        return prev + delta * alpha;
      };
      setHeading(prev => {
        const newHeading = smooth(prev, angle);
        Animated.timing(rotateAnim, {
          toValue: -newHeading,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        return newHeading;
      });
      const strength = Math.hypot(x, y, z);
      setCalibrationAccuracy(Math.min(strength / 50, 1));
    });
    return () => magnetometerRef.current?.remove();
  }, []);

  const getCardinalDirection = (deg: number) => {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <Animated.View
          style={{
            transform: [{
              rotate: rotateAnim.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })
            }]
          }}
        >
          <Svg height={compassSize} width={compassSize}>
            <Circle
              cx={center}
              cy={center}
              r={center - 10}
              stroke="#d4af37"
              strokeWidth="4"
              fill="rgba(26,95,63,0.1)"
            />
            <Circle
              cx={center}
              cy={center}
              r={center - 40}
              stroke="rgba(212,175,55,0.3)"
              strokeWidth="2"
              fill="none"
            />
            {Array.from({ length: 36 }, (_, i) => {
              const angle = i * 10;
              const isCardinal = angle % 90 === 0;
              const isMajor = angle % 30 === 0;
              const outerRadius = center - 10;
              const innerRadius = isCardinal
                ? center - 35
                : isMajor
                  ? center - 25
                  : center - 15;

              const x1 = center + Math.sin((angle * Math.PI) / 180) * outerRadius;
              const y1 = center - Math.cos((angle * Math.PI) / 180) * outerRadius;
              const x2 = center + Math.sin((angle * Math.PI) / 180) * innerRadius;
              const y2 = center - Math.cos((angle * Math.PI) / 180) * innerRadius;

              return (
                <Line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isCardinal ? "#d4af37" : "#fff"}
                  strokeWidth={isCardinal ? 3 : isMajor ? 2 : 1}
                />
              );
            })}
            <SvgText x={center} y="25" fontSize="24" fill="#d4af37" textAnchor="middle" fontWeight="bold">N</SvgText>
            <SvgText x={compassSize - 15} y={center + 8} fontSize="20" fill="#fff" textAnchor="middle">E</SvgText>
            <SvgText x={center} y={compassSize - 10} fontSize="20" fill="#fff" textAnchor="middle">S</SvgText>
            <SvgText x="15" y={center + 8} fontSize="20" fill="#fff" textAnchor="middle">W</SvgText>
            {location && (
              <Polygon
                points={`
                  ${center + Math.sin(qiblaDirection * Math.PI / 180) * (center - 40)},
                  ${center - Math.cos(qiblaDirection * Math.PI / 180) * (center - 40)}
                  ${center + Math.sin(qiblaDirection * Math.PI / 180) * (center - 60) - 8},
                  ${center - Math.cos(qiblaDirection * Math.PI / 180) * (center - 60)}
                  ${center + Math.sin(qiblaDirection * Math.PI / 180) * (center - 60) + 8},
                  ${center - Math.cos(qiblaDirection * Math.PI / 180) * (center - 60)}
                `}
                fill="#ff6b6b"
                stroke="#fff"
                strokeWidth="2"
              />
            )}
            <Circle cx={center} cy={center} r="6" fill="#d4af37" />
          </Svg>
        </Animated.View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.headingText}>
          {Math.round(heading)}° {getCardinalDirection(heading)}
        </Text>
        <Text style={styles.qiblaText}>
          Qibla Direction: {Math.round(qiblaDirection)}°
        </Text>
        <Text style={styles.calibrationText}>
          Calibration: {Math.round(calibrationAccuracy * 100)}%
        </Text>
        {location && (
          <>
            <Text style={styles.locationText}>
              Lat: {location.coords.latitude.toFixed(4)}°
            </Text>
            <Text style={styles.locationText}>
              Lng: {location.coords.longitude.toFixed(4)}°
            </Text>
            <Text style={styles.distanceText}>
              Distance to Kaaba: {Math.round(calculateDistance(
              location.coords.latitude,
              location.coords.longitude
            ))} km
            </Text>
          </>
        )}
      </View>
      {calibrationAccuracy < 0.5 && (
        <View style={styles.calibrationWarning}>
          <Text style={styles.warningText}>
            Move your device in a figure-8 to calibrate
          </Text>
        </View>
      )}
    </View>
  );
}

const calculateDistance = (lat1: number, lng1: number) => {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const R = 6371;
  const dLat = ((kaabaLat - lat1) * Math.PI) / 180;
  const dLng = ((kaabaLng - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((kaabaLat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0f3d2c' },
  compassContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center' },
  compass:         { backgroundColor: 'transparent' },
  infoContainer:   { padding: 20, alignItems: 'center' },
  headingText:     { color: '#d4af37', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  qiblaText:       { color: '#fff', fontSize: 18, marginBottom: 15 },
  locationText:    { color: '#ccc', fontSize: 14, marginBottom: 5 },
  distanceText:    { color: '#d4af37', fontSize: 14, fontWeight: 'bold' },
  calibrationText: { color: '#fff', fontSize: 14, marginBottom: 5 },
  calibrationWarning: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,107,107,0.9)',
    padding: 15,
    borderRadius: 10,
  },
  warningText:     { color: '#fff', textAlign: 'center', fontSize: 14 },
});
