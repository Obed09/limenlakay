'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// US States list
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

interface AddressData {
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressAutocompleteProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  onZipComplete?: (zip: string, state: string) => void;
  required?: boolean;
}

export function AddressAutocomplete({ 
  value, 
  onChange, 
  onZipComplete,
  required = false 
}: AddressAutocompleteProps) {
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Load Google Places API
  useEffect(() => {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      setIsGoogleLoaded(true);
      return;
    }

    // Only load if API key exists
    if (!googleMapsApiKey) {
      console.log('Google Maps API key not found - using manual input');
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isGoogleLoaded || !addressInputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          return;
        }

        let street = '';
        let city = '';
        let state = '';
        let zip = '';

        // Parse address components
        for (const component of place.address_components) {
          const types = component.types;

          if (types.includes('street_number')) {
            street = component.long_name;
          } else if (types.includes('route')) {
            street += (street ? ' ' : '') + component.long_name;
          } else if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
          } else if (types.includes('postal_code')) {
            zip = component.long_name;
          }
        }

        const newAddress = {
          address: street || value.address,
          city: city || value.city,
          state: state || value.state,
          zip: zip || value.zip,
        };

        onChange(newAddress);

        // Trigger shipping calculation if zip is complete
        if (zip && state && onZipComplete) {
          onZipComplete(zip, state);
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [isGoogleLoaded]);

  const handleZipChange = (newZip: string) => {
    onChange({ ...value, zip: newZip });
    
    // Trigger shipping calculation when zip is complete (5 digits)
    if (newZip.length === 5 && value.state && onZipComplete) {
      onZipComplete(newZip, value.state);
    }
  };

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <div>
        <Label htmlFor="address">
          Street Address {required && '*'}
        </Label>
        <Input
          ref={addressInputRef}
          id="address"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="Start typing your address..."
          required={required}
          autoComplete="off"
        />
        {isGoogleLoaded && (
          <p className="text-xs text-muted-foreground mt-1">
            Start typing for address suggestions
          </p>
        )}
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">
            City {required && '*'}
          </Label>
          <Input
            id="city"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="Miami"
            required={required}
          />
        </div>

        <div>
          <Label htmlFor="state">
            State {required && '*'}
          </Label>
          <Select
            value={value.state}
            onValueChange={(newState) => onChange({ ...value, state: newState })}
            required={required}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zip">
            ZIP Code {required && '*'}
          </Label>
          <Input
            id="zip"
            value={value.zip}
            onChange={(e) => handleZipChange(e.target.value)}
            placeholder="33101"
            maxLength={5}
            pattern="[0-9]{5}"
            required={required}
          />
        </div>
      </div>
    </div>
  );
}

// Simple state dropdown component (if you want to use it separately)
export function StateSelect({ 
  value, 
  onChange,
  required = false 
}: { 
  value: string; 
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} required={required}>
      <SelectTrigger>
        <SelectValue placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        {US_STATES.map((state) => (
          <SelectItem key={state.code} value={state.code}>
            {state.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
