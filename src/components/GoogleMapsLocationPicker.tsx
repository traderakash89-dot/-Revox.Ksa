import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Search, Navigation, Check, X, Loader2 } from 'lucide-react';

interface GoogleMapsLocationPickerProps {
  onLocationSelect: (location: {
    city: string;
    district: string;
    street: string;
    formattedAddress: string;
    lat?: number;
    lng?: number;
  }) => void;
  initialQuery?: string;
}

export const GoogleMapsLocationPicker: React.FC<GoogleMapsLocationPickerProps> = ({
  onLocationSelect,
  initialQuery = '',
}) => {
  const placesLib = useMapsLibrary('places');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 24.7136, // Riyadh default center
    lng: 46.6753,
  });
  const [selectedAddressText, setSelectedAddressText] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Initialize or maintain session token
  const getSessionToken = useCallback(() => {
    if (!placesLib) return null;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  }, [placesLib]);

  // Autocomplete fetch when user types
  useEffect(() => {
    if (!placesLib || !searchQuery.trim() || searchQuery.length < 2) {
      setPredictions([]);
      return;
    }

    const sessionToken = getSessionToken();
    let isCancelled = false;
    setIsLoadingPredictions(true);

    const timer = setTimeout(() => {
      placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: searchQuery,
        sessionToken: sessionToken || undefined,
        includedRegionCodes: ['SA'], // Focus on Saudi Arabia
      })
        .then((response) => {
          if (!isCancelled) {
            setPredictions(response.suggestions || []);
            setIsLoadingPredictions(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.warn('Place autocomplete error:', err);
            setIsLoadingPredictions(false);
          }
        });
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, placesLib, getSessionToken]);

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!suggestion.placePrediction) return;

    try {
      setIsLoadingPredictions(true);
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['location', 'formattedAddress', 'addressComponents', 'displayName'],
      });

      // Reset session token after place selection
      sessionTokenRef.current = null;
      setPredictions([]);

      const location = place.location;
      if (location) {
        setSelectedCoordinates({
          lat: location.lat(),
          lng: location.lng(),
        });
      }

      // Parse components for city, district, street
      let city = 'Riyadh';
      let district = '';
      let street = '';
      const components = place.addressComponents || [];

      for (const comp of components) {
        const types = comp.types || [];
        if (types.includes('locality')) {
          city = comp.longText || comp.shortText || city;
        } else if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          district = comp.longText || comp.shortText || district;
        } else if (types.includes('route')) {
          street = comp.longText || comp.shortText || street;
        } else if (types.includes('administrative_area_level_1') && !city) {
          city = comp.longText || comp.shortText || city;
        }
      }

      const formatted = place.formattedAddress || place.displayName || searchQuery;
      setSelectedAddressText(formatted);
      setSearchQuery(formatted);

      onLocationSelect({
        city: city || 'Riyadh',
        district: district || formatted.split(',')[0] || '',
        street: street || '',
        formattedAddress: formatted,
        lat: location ? location.lat() : undefined,
        lng: location ? location.lng() : undefined,
      });

      setIsLoadingPredictions(false);
      setIsOpen(false);
    } catch (err) {
      console.error('Error fetching place details:', err);
      setIsLoadingPredictions(false);
    }
  };

  // Device GPS Geolocation
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSelectedCoordinates({ lat, lng });

        // Reverse geocode if google geocoder is available
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            setIsDetectingLocation(false);
            if (status === 'OK' && results && results[0]) {
              const res = results[0];
              let city = 'Riyadh';
              let district = '';
              let street = '';

              for (const comp of res.address_components) {
                if (comp.types.includes('locality')) city = comp.long_name;
                if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) district = comp.long_name;
                if (comp.types.includes('route')) street = comp.long_name;
              }

              const formatted = res.formatted_address;
              setSelectedAddressText(formatted);
              setSearchQuery(formatted);

              onLocationSelect({
                city: city || 'Riyadh',
                district: district || formatted.split(',')[0] || '',
                street: street || '',
                formattedAddress: formatted,
                lat,
                lng,
              });
              setIsOpen(false);
            }
          });
        } else {
          setIsDetectingLocation(false);
          onLocationSelect({
            city: 'Riyadh',
            district: 'Current GPS Pin',
            street: '',
            formattedAddress: `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            lat,
            lng,
          });
          setIsOpen(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation failed:', err.message);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
        <span>📍 Select from Map</span>
      </button>

      {/* Modal Popup for Interactive Map and Places Search */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-100 text-cyan-800">
                  <MapPin className="w-4 h-4 text-cyan-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Choose Delivery Location (Google Maps)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Search your district, neighborhood, or pick a precise spot in Saudi Arabia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Places Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type district or city (e.g. Al Olaya, Riyadh, Al Hamra, Jeddah)..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
                {isLoadingPredictions ? (
                  <Loader2 className="w-4 h-4 text-cyan-600 animate-spin absolute right-3 top-3" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setPredictions([]);
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Suggestions dropdown list */}
              {predictions.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg divide-y divide-slate-100">
                  {predictions.map((p, idx) => {
                    const text = p.placePrediction?.text?.text || '';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(p)}
                        className="w-full px-3 py-2.5 text-left text-xs hover:bg-cyan-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900">{text}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Current GPS Quick Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleUseCurrentGPS}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-700 hover:text-cyan-800 font-semibold cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use My Current Location'}</span>
                </button>
                <span className="text-[10px] text-slate-400">Google Maps Platform</span>
              </div>
            </div>

            {/* Interactive Map Visual */}
            <div className="h-64 sm:h-72 w-full bg-slate-100 relative">
              <Map
                mapId="DEMO_MAP_ID"
                defaultZoom={13}
                center={selectedCoordinates}
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="w-full h-full"
              >
                <AdvancedMarker position={selectedCoordinates} />
              </Map>
            </div>

            {/* Modal Footer with Confirmation */}
            <div className="p-4 border-t border-slate-100 bg-[#F8FAFC] flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600 truncate max-w-[280px]">
                {selectedAddressText ? (
                  <span className="text-slate-900 font-medium truncate block">{selectedAddressText}</span>
                ) : (
                  <span>Pinpoint: {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedAddressText) {
                      onLocationSelect({
                        city: 'Riyadh',
                        district: 'Riyadh City Center',
                        street: '',
                        formattedAddress: `Coordinates: ${selectedCoordinates.lat.toFixed(4)}, ${selectedCoordinates.lng.toFixed(4)}`,
                        lat: selectedCoordinates.lat,
                        lng: selectedCoordinates.lng,
                      });
                    }
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Location</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
