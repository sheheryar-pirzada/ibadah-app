// hooks/useLocation.ts
import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

type LocationContextType = {
  loc: Location.LocationObject | null;
  qibla: number;
};

const LocationContext = createContext<LocationContextType>({ loc: null, qibla: 0 });

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [loc, setLoc] = useState<Location.LocationObject | null>(null);
  const [qibla, setQibla] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to calculate Qibla direction.'
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setLoc(position);

      // compute bearing to Kaaba
      const bearing = calculateQiblaDirection(
        position.coords.latitude,
        position.coords.longitude
      );
      setQibla(bearing);
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ loc, qibla }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}

function calculateQiblaDirection(userLat: number, userLng: number): number {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (kaabaLat * Math.PI) / 180;
  const Δλ = ((kaabaLng - userLng) * Math.PI) / 180;

  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let θ = (Math.atan2(x, y) * 180) / Math.PI;
  return (θ + 360) % 360;
}
