// hooks/useLocation.ts
import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { Qibla, Coordinates } from 'adhan';

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

      // compute bearing to Kaaba using adhan's Qibla function
      const coordinates = new Coordinates(
        position.coords.latitude,
        position.coords.longitude
      );
      const bearing = Qibla(coordinates);
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
