import { useState, useEffect, useCallback } from 'react';
import { UserLocationState, ProximityResult } from '../types/alert';
import { requestDeviceLocation, PRESET_LOCATIONS, PresetLocation, reverseGeocodeLocal } from '../services/locationService';
import { evaluateRiverProximity } from '../services/geoUtils';
import { DEFAULT_PRIMARY_STATION_ID } from '../config/stationsConfig';

export function useUserLocation() {
  // Default to the Rewa Division preset so the user immediately sees the Sone river alert context
  // while prompting for device location
  const defaultPreset = PRESET_LOCATIONS[0];

  const [locationState, setLocationState] = useState<UserLocationState>({
    coords: { latitude: defaultPreset.lat, longitude: defaultPreset.lng },
    accuracyMeters: 50,
    locality: defaultPreset.division,
    district: defaultPreset.district,
    state: defaultPreset.state,
    isCustomLocation: false,
    isDetecting: false,
    error: null,
    permissionGranted: null,
  });

  const [proximity, setProximity] = useState<ProximityResult>(() =>
    evaluateRiverProximity(defaultPreset.lat, defaultPreset.lng)
  );

  const updateCoordinates = useCallback(async (lat: number, lng: number, localityName?: string, isCustom = true) => {
    setLocationState((prev) => ({ ...prev, isDetecting: true, error: null }));
    const geocode = localityName
      ? { locality: localityName, district: 'Selected Region', state: 'India' }
      : await reverseGeocodeLocal(lat, lng);

    const prox = evaluateRiverProximity(lat, lng);
    setProximity(prox);

    setLocationState({
      coords: { latitude: lat, longitude: lng },
      accuracyMeters: isCustom ? 10 : 50,
      locality: geocode.locality,
      district: geocode.district,
      state: geocode.state,
      isCustomLocation: isCustom,
      isDetecting: false,
      error: null,
      permissionGranted: isCustom ? null : true,
    });
  }, []);

  const requestLocation = useCallback(async () => {
    setLocationState((prev) => ({ ...prev, isDetecting: true, error: null }));
    const result = await requestDeviceLocation();

    if (result.coords) {
      const prox = evaluateRiverProximity(result.coords.latitude, result.coords.longitude);
      setProximity(prox);
    }
    setLocationState(result);
  }, []);

  const selectPreset = useCallback((preset: PresetLocation) => {
    updateCoordinates(preset.lat, preset.lng, preset.name, true);
  }, [updateCoordinates]);

  return {
    locationState,
    proximity,
    requestLocation,
    selectPreset,
    updateCoordinates,
  };
}
