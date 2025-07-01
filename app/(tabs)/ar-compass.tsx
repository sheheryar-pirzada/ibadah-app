import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Magnetometer } from 'expo-sensors';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';
import { useLocation } from '@/hooks/useLocation';

const { width, height } = Dimensions.get('window');

export default function ARCompassScreen() {
  // pull out `loc` and `qibla` from context, then rename to match
  const { loc: location, qibla: qiblaDirection } = useLocation();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean|null>(null);
  const [heading, setHeading]       = useState(0);
  const [calibrationAccuracy, setCalibrationAccuracy] = useState(0);
  const magnetometerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();

    Magnetometer.setUpdateInterval(100);
    magnetometerRef.current = Magnetometer.addListener(({ x, y, z }) => {
      let angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      setHeading(angle);
      const strength = Math.hypot(x, y, z);
      setCalibrationAccuracy(Math.min(strength / 50, 1));
    });

    return () => magnetometerRef.current?.remove();
  }, []);

  const getCardinalDirection = (deg: number) => {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg/45)%8];
  };

  const getQiblaOffset = () => (qiblaDirection - heading + 360) % 360;

  if (hasCameraPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission…</Text></View>;
  }
  if (!hasCameraPermission) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* ← add `type` here */}
      <CameraView style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Svg width="100%" height="100%" style={styles.svg}>
            <Line
              x1="0" y1={height/2}
              x2={width} y2={height/2}
              stroke="rgba(255,255,255,0.3)" strokeWidth="1"
            />
            <Line
              x1={width/2} y1="0"
              x2={width/2} y2={height}
              stroke="rgba(255,255,255,0.3)" strokeWidth="1"
            />
            {location && (
              <Polygon
                points={
                  `${width/2 + Math.sin(getQiblaOffset()*Math.PI/180)*100},${height/2 - Math.cos(getQiblaOffset()*Math.PI/180)*100} ` +
                  `${width/2 + Math.sin(getQiblaOffset()*Math.PI/180)*80-10},${height/2 - Math.cos(getQiblaOffset()*Math.PI/180)*80} ` +
                  `${width/2 + Math.sin(getQiblaOffset()*Math.PI/180)*80+10},${height/2 - Math.cos(getQiblaOffset()*Math.PI/180)*80}`
                }
                fill="#d4af37"
                stroke="#fff"
                strokeWidth="2"
              />
            )}
            <SvgText
              x={width/2}
              y="30"
              fontSize="20"
              fill="#fff"
              textAnchor="middle"
              fontWeight="bold"
            >
              N
            </SvgText>
          </Svg>

          <View style={styles.infoPanel}>
            <Text style={styles.infoText}>
              Heading: {Math.round(heading)}° {getCardinalDirection(heading)}
            </Text>
            <Text style={styles.infoText}>
              Qibla: {Math.round(qiblaDirection)}°
            </Text>
            <Text style={styles.infoText}>
              Calibration: {Math.round(calibrationAccuracy * 100)}%
            </Text>
            {location && (
              <Text style={styles.distanceText}>
                Distance: {Math.round(
                calculateDistance(
                  location.coords.latitude,
                  location.coords.longitude
                )
              )} km
              </Text>
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
      </CameraView>
    </View>
  );
}

const calculateDistance = (lat1: number, lng1: number) => {
  const [kaabaLat, kaabaLng] = [21.4225, 39.8262];
  const R = 6371;
  const dLat = (kaabaLat - lat1) * Math.PI/180;
  const dLng = (kaabaLng - lng1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2
    + Math.cos(lat1*Math.PI/180)
    * Math.cos(kaabaLat*Math.PI/180)
    * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0f3d2c' },
  camera:             { flex: 1 },
  overlay:            { flex: 1, backgroundColor: 'transparent' },
  svg:                { position: 'absolute', top: 0, left: 0 },
  infoPanel:          { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 15, borderRadius: 10 },
  infoText:           { color: '#fff', fontSize: 16, marginBottom: 5 },
  distanceText:       { color: '#d4af37', fontSize: 14, fontWeight: 'bold' },
  calibrationWarning: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: 'rgba(255,107,107,0.9)', padding: 15, borderRadius: 10 },
  warningText:        { color: '#fff', textAlign: 'center', fontSize: 14 },
});
