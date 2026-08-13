import React, { createContext, useContext, useReducer } from 'react';

import config from './config';
import hcmData from './data/hcm_data.json';

const { lastUpdated, events } = hcmData;

// Group events by location to count events at each location
const locationMap = {};
events.forEach((event) => {
  const coordKey = `${event.coordinates[0]},${event.coordinates[1]}`;
  if (!locationMap[coordKey]) {
    locationMap[coordKey] = [];
  }
  locationMap[coordKey].push(event);
});

// Transform the events data to match the expected marker format
// Each unique location gets one marker with the count of events at that location
const transformedMarkers = Object.entries(locationMap).map(
  ([, eventsAtLocation]) => {
    // Use the first event's details for the marker, but aggregate information
    const firstEvent = eventsAtLocation[0];
    return {
      id: firstEvent.id,
      phase: firstEvent.phase,
      year: firstEvent.year,
      city: firstEvent.location, // Using location as city for compatibility
      coordinates: firstEvent.coordinates,
      eventName: firstEvent.eventName,
      description: firstEvent.description,
      mediaUrl: firstEvent.mediaUrl,
      sourceMedia: firstEvent.sourceMedia,
      quoteSource: firstEvent.quoteSource,
      templateType: firstEvent.templateType,
      references: firstEvent.references,
      value: eventsAtLocation.length, // Number of events at this location
      eventsCount: eventsAtLocation.length,
      eventsAtLocation: eventsAtLocation, // Store all events at this location
    };
  }
);

export const initialState = {
  config,
  focusedMarker: null,
  hasLoaded: false,
  lastUpdated,
  markers: transformedMarkers,
  events: events, // Keep original events data for detailed info
  start: false,
  journeyPath: [], // Array of coordinates representing the path traveled
  selectedPhase: null, // The chapter/phase currently being viewed
  isMapTransitioning: false, // Flag to show the map during transitions
};

export function reducer(state, action) {
  const { payload, type } = action;
  switch (type) {
    case 'LOADED':
      return {
        ...state,
        hasLoaded: true,
      };
    case 'START_CHAPTER': {
      // Auto-focus the first chronological event of the selected phase
      const phaseId = payload; // Expected to be 1, 2, 3, 4, or 5
      const phaseEvents = state.events.filter(e => e.phase === phaseId);
      const sortedEvents = [...phaseEvents].sort((a, b) => a.id - b.id);
      const firstEvent = sortedEvents[0];
      
      const firstMarker = state.markers.find(m => {
        if (m.id === firstEvent.id) return true;
        if (m.eventsAtLocation) return m.eventsAtLocation.some(e => e.id === firstEvent.id);
        return false;
      });

      const tempMarker = firstMarker ? {
        ...firstMarker,
        id: firstEvent.id,
        phase: firstEvent.phase,
        year: firstEvent.year,
        city: firstEvent.location,
        eventName: firstEvent.eventName,
        description: firstEvent.description,
        mediaUrl: firstEvent.mediaUrl,
        sourceMedia: firstEvent.sourceMedia,
        templateType: firstEvent.templateType,
        references: firstEvent.references,
        eventsAtLocation: undefined,
      } : null;

      return {
        ...state,
        start: true,
        selectedPhase: phaseId,
        focusedMarker: tempMarker,
        journeyPath: tempMarker ? [tempMarker.coordinates] : [],
        isMapTransitioning: false, // Map is hidden when reading
      };
    }
    case 'START_TRANSITION':
      return {
        ...state,
        isMapTransitioning: true,
      };
    case 'END_TRANSITION':
      return {
        ...state,
        isMapTransitioning: false,
      };
    case 'FOCUS': {
      // When focusing a new marker, add its coordinates to the journey path if different from last
      const newCoords = payload?.coordinates;
      let newJourneyPath = state.journeyPath || [];
      if (newCoords) {
        const lastCoords = newJourneyPath[newJourneyPath.length - 1];
        if (!lastCoords || lastCoords[0] !== newCoords[0] || lastCoords[1] !== newCoords[1]) {
          // Keep only the previous location and the new location to show a single segment
          if (newJourneyPath.length > 0) {
            newJourneyPath = [lastCoords, newCoords];
          } else {
            newJourneyPath = [newCoords];
          }
        }
      }
      return {
        ...state,
        focusedMarker: payload,
        journeyPath: payload ? newJourneyPath : [], // Reset path if unfocusing (payload is null)
      };
    }
    case 'UNFOCUS':
      return {
        ...state,
        focusedMarker: null,
        journeyPath: [],
      };
    case 'GO_HOME':
      return {
        ...state,
        start: false,
        focusedMarker: null,
        selectedPhase: null,
        journeyPath: [],
        isMapTransitioning: false,
      };
    default:
      return state;
  }
}

const StateContext = createContext(null);

export function StateProvider({ children, initialState, reducer }) {
  return (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
      {children}
    </StateContext.Provider>
  );
}

export function useStateValue() {
  return useContext(StateContext);
}
