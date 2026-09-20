import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Ambulance,
  PhoneCall,
  Flame,
  Shield,
  AlertTriangle,
  ArrowLeft,
  X,
  Clock,
  Radio,
  ChevronDown,
  ChevronUp,
  MapPin,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CompassWidget } from './CompassWidget';
import { useAppStore } from '../stores/useAppStore';

export interface MapIncident {
  id: string;
  code: string;
  type: string;
  title: string;
  severity: 'CRITICAL' | 'URGENT' | 'STANDARD';
  status: string;
  location: string;
  sector: string;
  coords: { x: number; y: number };
  leadUnit: string;
  eta: string;
  affected: string;
  timeline: Array<{ time: string; event: string; status: 'completed' | 'active' | 'pending' }>;
  assignedUnits: Array<{ id: string; name: string; type: string; role: string; eta: string; status: string }>;
  risks: string[];
  actions: string[];
}

export interface MapVehicle {
  id: string;
  callsign: string;
  model: string;
  tier: string;
  status: 'EN_ROUTE' | 'ON_SCENE' | 'STAGED';
  statusLabel: string;
  coords: { x: number; y: number };
  assignedIncidentId: string;
  eta: string;
  speed: string;
  fuel: string;
  crew: string;
  routeId?: string;
  equipment: Array<{ name: string; status: string; detail: string }>;
  telemetry: { speed: number; fuel: number; temp: string; pressure: string };
}

interface MapHazard {
  id: string;
  title: string;
  type: string;
  coords: { x: number; y: number };
  radius: number;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  description: string;
}

// 1. Authoritative Incident Registry
export const INCIDENTS_DATA: Record<string, MapIncident> = {
  'INC-882': {
    id: 'INC-882',
    code: 'INC-882',
    type: 'COLLAPSE',
    title: 'Market St. Structural Collapse',
    severity: 'CRITICAL',
    status: 'ACTIVE EXTRACTION',
    location: 'Market St. & 4th Ave',
    sector: 'Sector 4 Core',
    coords: { x: 540, y: 290 },
    leadUnit: 'RESCUE-08 (AMB-C08)',
    eta: '4 min',
    affected: '6 Victims Reported (2 Extracted, 4 Trapped)',
    timeline: [
      { time: '14:28 UTC', event: 'Seismic trigger detected; initial 911 alert logged', status: 'completed' },
      { time: '14:32 UTC', event: 'RESCUE-08 deployed from Station 4 with heavy hydraulics', status: 'completed' },
      { time: '14:38 UTC', event: 'Safety perimeter established (50m safety cordon)', status: 'completed' },
      { time: '14:44 UTC', event: 'Heavy hydraulic shoring underway; AMB-A12 inbound', status: 'active' },
      { time: '14:52 UTC (Est.)', event: 'Primary patient extraction & trauma transit staging', status: 'pending' },
    ],
    assignedUnits: [
      { id: 'AMB-C08', name: 'RESCUE-08', type: 'Heavy Rescue', role: 'Incident Commander', eta: 'On Scene', status: 'On Scene' },
      { id: 'AMB-A12', name: 'UNIT-12 (AMB-A12)', type: 'ALS Ambulance', role: 'Primary Trauma Transport', eta: '4 min', status: 'En Route' },
      { id: 'AMB-A19', name: 'RESCUE-19', type: 'Paramedic Rapid', role: 'Secondary Triage Staging', eta: '8 min', status: 'En Route' },
    ],
    risks: [
      'Bearing wall shear failure with imminent secondary structural shift',
      'High-pressure gas main isolated; utility provider verified safe',
      'Unstable east quadrant rubble pile requiring continuous laser monitoring',
    ],
    actions: [
      'Deploy secondary pneumatic shoring jacks to stabilize eastern stairwell',
      'Maintain clear emergency vehicle transit corridor along 4th Ave North',
      'Pre-alert Mercy General Level-1 Trauma Resuscitation Bay',
    ],
  },
  'INC-408': {
    id: 'INC-408',
    code: 'INC-408',
    type: 'HAZMAT',
    title: 'Industrial Chemical Depot Vapor Leak',
    severity: 'URGENT',
    status: 'CONTAINMENT IN PROGRESS',
    location: '1200 Industrial Parkway',
    sector: 'Sector 2 Depot',
    coords: { x: 780, y: 180 },
    leadUnit: 'ENGINE-03 (ENG-03)',
    eta: '6 min',
    affected: 'Depot Staff Evacuated · 500m Perimeter Secured',
    timeline: [
      { time: '14:41 UTC', event: 'Toxic vapor plume detected by automated fence-line sensors', status: 'completed' },
      { time: '14:45 UTC', event: 'Facility evacuation ordered; alarm sounded', status: 'completed' },
      { time: '14:50 UTC', event: 'ENGINE-03 dispatched with dry foam containment payload', status: 'active' },
    ],
    assignedUnits: [
      { id: 'ENG-03', name: 'ENGINE-03', type: 'Hazmat Foam Engine', role: 'Suppression & Containment', eta: '6 min', status: 'En Route' },
    ],
    risks: [
      'Toxic vapor dispersion downwind towards perimeter buffer',
      'Class 3 flammable liquid storage adjacent to leak source',
    ],
    actions: [
      'Establish water curtain to knock down airborne chemical plume',
      'Maintain 500m exclusion perimeter until air quality reads nominal',
    ],
  },
  'INC-204': {
    id: 'INC-204',
    code: 'INC-204',
    type: 'FLOOD',
    title: 'Flash Flood Evacuation & River Crest',
    severity: 'STANDARD',
    status: 'EVACUATION STAGING',
    location: 'Lowland River Basin',
    sector: 'Sector 1 Basin',
    coords: { x: 240, y: 440 },
    leadUnit: 'MEDIC-07 (AMB-A07)',
    eta: 'On Scene',
    affected: '45 Residents Staged for Transport to Shelter',
    timeline: [
      { time: '13:55 UTC', event: 'River crest warning threshold breached (3.8m)', status: 'completed' },
      { time: '14:15 UTC', event: 'Evacuation bus staging point established', status: 'completed' },
      { time: '14:30 UTC', event: 'Priority elderly & medical transports completed', status: 'active' },
    ],
    assignedUnits: [
      { id: 'AMB-A07', name: 'MEDIC-07', type: 'Transport Ambulance', role: 'Evacuation Transit', eta: 'On Scene', status: 'On Scene' },
    ],
    risks: [
      'Secondary levee overtopping if rainfall exceeds 20mm/hr',
    ],
    actions: [
      'Complete stage 2 resident transport to High School shelter',
      'Monitor river gauge sensor telemetry every 15 minutes',
    ],
  },
};

// 2. Authoritative Vehicle Registry
export const VEHICLES_DATA: Record<string, MapVehicle> = {
  'ENG-03': {
    id: 'ENG-03',
    callsign: 'ENGINE-03 (ENG-03)',
    model: 'Hazmat Foam Pumper Engine',
    tier: 'Fire & Chemical Suppression',
    status: 'EN_ROUTE',
    statusLabel: 'En Route · Code-3',
    coords: { x: 920, y: 390 },
    assignedIncidentId: 'INC-408',
    eta: '6 min',
    speed: '58 km/h',
    fuel: '71% (35 gal)',
    crew: 'Capt. T. Murphy, 3 Hazmat Techs',
    routeId: 'routeHazmat',
    equipment: [
      { name: 'Fluorine-Free Foam Cell (1,000 Gal)', status: 'Armed', detail: 'Vapor suppression ready' },
      { name: 'MultiRAE 5-Gas Vapor Detector', status: 'Online', detail: 'Zero explosive gas detected en route' },
    ],
    telemetry: { speed: 58, fuel: 71, temp: '70°F', pressure: '42 PSI' },
  },
  'AMB-A12': {
    id: 'AMB-A12',
    callsign: 'UNIT-12 (AMB-A12)',
    model: 'Type-1 ALS Heavy Ambulance',
    tier: 'ALS Tier-1 Intensive Care',
    status: 'EN_ROUTE',
    statusLabel: 'En Route · Code-3',
    coords: { x: 480, y: 325 },
    assignedIncidentId: 'INC-882',
    eta: '4 min',
    speed: '62 km/h',
    fuel: '78% (18 gal)',
    crew: 'Capt. Carlos Rivera (Paramedic Lead), M. Ramos (EMT-P)',
    routeId: 'routeAmber',
    equipment: [
      { name: 'Trauma Kit Alpha-1', status: 'Ready', detail: 'Hemostatic dressings, chest seals' },
      { name: 'Zoll X-Series ALS Monitor', status: 'Live', detail: 'Telemetry streaming to command' },
      { name: 'Hamilton T1 Ventilator', status: 'Calibrated', detail: 'O2 line pressure 52 PSI' },
    ],
    telemetry: { speed: 62, fuel: 78, temp: '68°F', pressure: '36 PSI' },
  },
  'AMB-C08': {
    id: 'AMB-C08',
    callsign: 'RESCUE-08 (AMB-C08)',
    model: 'Heavy Technical Rescue Unit',
    tier: 'Structural Collapse & Shoring',
    status: 'ON_SCENE',
    statusLabel: 'On Scene · Command Post',
    coords: { x: 575, y: 265 },
    assignedIncidentId: 'INC-882',
    eta: 'On Scene',
    speed: '0 km/h (Stationary)',
    fuel: '84% (22 gal)',
    crew: 'Lt. Sarah Chen, 3 Certified Rescue Technicians',
    routeId: 'routeCyan',
    equipment: [
      { name: 'Holmatro Hydraulic Extrication Spreader', status: 'Active', detail: '10,000 PSI spreading force' },
      { name: 'Paratech Pneumatic Shoring Struts', status: 'Deployed', detail: 'Stabilizing eastern bearing wall' },
      { name: 'Flir Thermal Search Drone', status: 'Airborne', detail: 'Laser mesh grid scanning' },
    ],
    telemetry: { speed: 0, fuel: 84, temp: '65°F', pressure: '38 PSI' },
  },
};

// 3. Vehicle Polyline Routes for Movement Simulation
export const VEHICLE_ROUTES: Record<string, Array<{ x: number; y: number }>> = {
  'ENG-03': [
    { x: 920, y: 390 }, // Station 9
    { x: 880, y: 330 },
    { x: 830, y: 260 },
    { x: 780, y: 180 }, // INC-408 Depot
  ],
  'AMB-A12': [
    { x: 140, y: 460 }, // Station 4
    { x: 280, y: 430 },
    { x: 440, y: 410 },
    { x: 510, y: 340 },
    { x: 540, y: 290 }, // INC-882 Market St
  ],
  'AMB-C08': [
    { x: 380, y: 420 },
    { x: 380, y: 290 },
    { x: 510, y: 290 },
    { x: 540, y: 290 },
  ],
};

// Polyline Interpolation Helper
interface InterpolatedPosition {
  x: number;
  y: number;
  headingAngle: number;
  traversedPath: string;
  remainingPath: string;
}

function interpolateSpline(
  points: Array<{ x: number; y: number }>,
  progress: number
): InterpolatedPosition {
  if (!points || points.length === 0) {
    return { x: 0, y: 0, headingAngle: 0, traversedPath: '', remainingPath: '' };
  }
  if (points.length === 1) {
    return {
      x: points[0].x,
      y: points[0].y,
      headingAngle: 0,
      traversedPath: `M ${points[0].x} ${points[0].y}`,
      remainingPath: '',
    };
  }

  const clampedT = Math.max(0, Math.min(1, progress));

  // Cumulative lengths
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalLength += len;
  }

  const targetDist = clampedT * totalLength;
  let accumulated = 0;
  let segIndex = 0;
  let segFraction = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    if (accumulated + segmentLengths[i] >= targetDist || i === segmentLengths.length - 1) {
      segIndex = i;
      segFraction = segmentLengths[i] > 0 ? (targetDist - accumulated) / segmentLengths[i] : 0;
      break;
    }
    accumulated += segmentLengths[i];
  }

  const p0 = points[segIndex];
  const p1 = points[segIndex + 1];
  const currentX = p0.x + (p1.x - p0.x) * segFraction;
  const currentY = p0.y + (p1.y - p0.y) * segFraction;

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const headingAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Build traversed path string
  let traversedPath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i <= segIndex; i++) {
    traversedPath += ` L ${points[i].x} ${points[i].y}`;
  }
  traversedPath += ` L ${currentX} ${currentY}`;

  // Build remaining path string
  let remainingPath = `M ${currentX} ${currentY}`;
  for (let i = segIndex + 1; i < points.length; i++) {
    remainingPath += ` L ${points[i].x} ${points[i].y}`;
  }

  return { x: currentX, y: currentY, headingAngle, traversedPath, remainingPath };
}

// 4. Authoritative Hazard Boundaries
const HAZARDS_DATA: MapHazard[] = [
  {
    id: 'HAZ-882',
    title: 'Debris Shoring Safety Perimeter',
    type: 'Structural Collapse Perimeter',
    coords: { x: 540, y: 290 },
    radius: 48,
    severity: 'CRITICAL',
    description: '50m safety cordon around collapsed bearing structure',
  },
  {
    id: 'HAZ-408',
    title: 'Toxic Vapor Exclusion Zone',
    type: 'Chemical Depot Evacuation Zone',
    coords: { x: 780, y: 180 },
    radius: 44,
    severity: 'WARNING',
    description: '500m evacuation perimeter for vapor containment',
  },
  {
    id: 'HAZ-204',
    title: 'River Basin Crest Inundation',
    type: 'Lowland Flood Zone',
    coords: { x: 240, y: 440 },
    radius: 38,
    severity: 'ADVISORY',
    description: 'Lowland river basin cresting risk area',
  },
];

interface MapPlaceholderProps {
  className?: string;
  selectedVehicleId?: string;
  selectedIncidentId?: string | null;
  onSelectVehicle?: (id: string) => void;
  onSelectIncident?: (id: string) => void;
  showRoutes?: boolean;
  showAlerts?: boolean;
  showEmergencyCall?: boolean;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  className,
  selectedVehicleId = 'ENG-03',
  selectedIncidentId = null,
  onSelectVehicle,
  onSelectIncident,
  showRoutes = true,
  showAlerts = true,
  showEmergencyCall = false,
}) => {
  const {
    activeSimulations,
    updateVehicleSimulation,
    completeVehicleArrival,
    addNotification,
    activeFilter,
    searchQuery,
  } = useAppStore();

  // Interaction State Machine: 'overview' | 'focus'
  const [viewState, setViewState] = useState<'overview' | 'focus'>('overview');
  const [focusedType, setFocusedType] = useState<'incident' | 'vehicle' | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Camera State: zoom & pan offsets
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Filter Layer (local tab overrides if selected, otherwise syncs with global activeFilter)
  const [activeLegend, setActiveLegend] = useState<'all' | 'enroute' | 'onscene' | 'hazards'>('all');

  // Progressive Disclosure Accordions in Detail Panel
  const [expandedSection, setExpandedSection] = useState<'timeline' | 'units' | 'risks' | 'actions' | 'none'>('timeline');

  // Hover Tooltip state
  const [hoveredItem, setHoveredItem] = useState<{ id: string; label: string; coords: { x: number; y: number } } | null>(null);

  // Focus on incident
  const focusOnIncident = useCallback((incId: string, notifyParent = true) => {
    const inc = INCIDENTS_DATA[incId];
    if (!inc) return;

    setViewState('focus');
    setFocusedType('incident');
    setFocusedId(incId);
    setExpandedSection('timeline');

    // Smooth pan offset leaving right 360px open for floating detail panel
    const targetX = inc.coords.x;
    const targetY = inc.coords.y;
    const offsetX = (500 - targetX) - 100;
    const offsetY = (300 - targetY);

    setPanOffset({ x: offsetX, y: offsetY });
    setZoomLevel(1.85);

    if (notifyParent && onSelectIncident) {
      onSelectIncident(incId);
    }
  }, [onSelectIncident]);

  // Focus on vehicle
  const focusOnVehicle = useCallback((unitId: string, notifyParent = true) => {
    const veh = VEHICLES_DATA[unitId];
    if (!veh) return;

    setViewState('focus');
    setFocusedType('vehicle');
    setFocusedId(unitId);
    setExpandedSection('units');

    // Get current simulation coords if moving
    const route = VEHICLE_ROUTES[unitId];
    const sim = activeSimulations[unitId];
    const pos = route && sim ? interpolateSpline(route, sim.progress) : veh.coords;

    const offsetX = (500 - pos.x) - 90;
    const offsetY = (300 - pos.y);

    setPanOffset({ x: offsetX, y: offsetY });
    setZoomLevel(1.85);

    if (notifyParent && onSelectVehicle) {
      onSelectVehicle(unitId);
    }
  }, [onSelectVehicle, activeSimulations]);

  // Return to Overview
  const handleBackToOverview = useCallback(() => {
    setViewState('overview');
    setFocusedType(null);
    setFocusedId(null);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setHoveredItem(null);
  }, []);

  // Keyboard shortcut: Escape returns to overview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewState === 'focus') {
        handleBackToOverview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, handleBackToOverview]);

  // Initial Mount Ref to preserve clean Overview state
  const isInitialMount = useRef(true);
  const prevIncidentRef = useRef(selectedIncidentId);
  const prevVehicleRef = useRef(selectedVehicleId);

  // Synchronize when external props select an incident
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (selectedIncidentId && selectedIncidentId !== prevIncidentRef.current && INCIDENTS_DATA[selectedIncidentId]) {
      prevIncidentRef.current = selectedIncidentId;
      focusOnIncident(selectedIncidentId, false);
    }
  }, [selectedIncidentId, focusOnIncident]);

  // Synchronize when external props select a vehicle
  useEffect(() => {
    if (selectedVehicleId && selectedVehicleId !== prevVehicleRef.current && VEHICLES_DATA[selectedVehicleId] && !selectedIncidentId) {
      prevVehicleRef.current = selectedVehicleId;
      focusOnVehicle(selectedVehicleId, false);
    }
  }, [selectedVehicleId, selectedIncidentId, focusOnVehicle]);

  // Live Search Match Trigger
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const q = searchQuery.trim().toUpperCase();

    // Check incident match
    const matchedInc = Object.values(INCIDENTS_DATA).find(
      (inc) => inc.code.includes(q) || inc.title.toUpperCase().includes(q) || inc.type.includes(q)
    );
    if (matchedInc) {
      focusOnIncident(matchedInc.id);
      return;
    }

    // Check vehicle match
    const matchedVeh = Object.values(VEHICLES_DATA).find(
      (v) => v.id.includes(q) || v.callsign.toUpperCase().includes(q)
    );
    if (matchedVeh) {
      focusOnVehicle(matchedVeh.id);
    }
  }, [searchQuery, focusOnIncident, focusOnVehicle]);

  // REAL-TIME VEHICLE TRANSIT ANIMATION & SMOOTH CAMERA FOLLOW LOOP
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      Object.entries(activeSimulations).forEach(([unitId, sim]) => {
        if (sim.status === 'EN_ROUTE') {
          // Complete travel in ~14 seconds
          const speedFactor = 0.075;
          const newProgress = Math.min(1.0, sim.progress + speedFactor * dt);

          const distanceRemaining = Math.max(0, (1 - newProgress) * 3.4);
          const eta = Math.ceil((1 - newProgress) * 6);
          const currentSpeed = newProgress > 0.9 ? 24 : newProgress < 0.1 ? 38 : 64;
          const status = newProgress >= 1.0 ? 'ON_SCENE' : newProgress >= 0.9 ? 'ARRIVING' : 'EN_ROUTE';

          updateVehicleSimulation(unitId, {
            progress: newProgress,
            distanceRemainingKm: Number(distanceRemaining.toFixed(1)),
            etaMinutes: eta,
            speedKmH: status === 'ON_SCENE' ? 0 : currentSpeed,
            status,
          });

          // Camera Follow: gently track vehicle while focused on it
          if (focusedId === unitId && viewState === 'focus' && newProgress < 1.0) {
            const route = VEHICLE_ROUTES[unitId];
            if (route) {
              const currentPos = interpolateSpline(route, newProgress);
              setPanOffset((prev) => ({
                x: prev.x + (500 - currentPos.x - 90 - prev.x) * 0.04,
                y: prev.y + (300 - currentPos.y - prev.y) * 0.04,
              }));
            }
          }

          if (newProgress >= 1.0) {
            completeVehicleArrival(unitId);
            if (focusedId === unitId) {
              setZoomLevel(2.0);
            }
          }
        }
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeSimulations, focusedId, viewState, updateVehicleSimulation, completeVehicleArrival]);

  // Check if item matches the active global filter
  const matchesGlobalFilter = (itemType: 'incident' | 'vehicle', itemData: any) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Critical') {
      return itemType === 'incident' ? itemData.severity === 'CRITICAL' : itemData.assignedIncidentId === 'INC-882';
    }
    if (activeFilter === 'Urgent') {
      return itemType === 'incident' ? itemData.severity === 'URGENT' : itemData.assignedIncidentId === 'INC-408';
    }
    if (activeFilter === 'En Route') {
      if (itemType === 'vehicle') {
        const sim = activeSimulations[itemData.id];
        return sim?.status === 'EN_ROUTE' || itemData.status === 'EN_ROUTE';
      }
      return true;
    }
    if (activeFilter === 'On Scene') {
      if (itemType === 'vehicle') {
        const sim = activeSimulations[itemData.id];
        return sim?.status === 'ON_SCENE' || itemData.status === 'ON_SCENE';
      }
      return true;
    }
    return true;
  };

  // Check if an element should be dimmed during Focus state
  const isElementDimmed = (itemId: string, relatedIds: string[] = []) => {
    if (viewState !== 'focus') return false;
    if (focusedId === itemId) return false;
    if (relatedIds.includes(focusedId || '')) return false;
    return true;
  };

  const currentIncident = focusedType === 'incident' && focusedId ? INCIDENTS_DATA[focusedId] : null;
  const currentVehicle = focusedType === 'vehicle' && focusedId ? VEHICLES_DATA[focusedId] : null;

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-[#0a0c0f] border border-white/10 shadow-2xl select-none group ${
        className || 'h-[500px]'
      }`}
    >
      {/* 1. Tactical SVG Cartography Canvas */}
      <div
        className="absolute inset-0 bg-[#0b0d11] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center cursor-grab active:cursor-grabbing"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && viewState === 'focus') {
            handleBackToOverview();
          }
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Dark Tactical Grid Pattern */}
            <pattern id="cityStreetGrid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#080a0e" />
              <rect x="8" y="8" width="38" height="38" rx="3" fill="#101319" />
              <rect x="54" y="8" width="38" height="38" rx="3" fill="#101319" />
              <rect x="8" y="54" width="38" height="38" rx="3" fill="#101319" />
              <rect x="54" y="54" width="38" height="38" rx="3" fill="#101319" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#161a23" strokeWidth="2.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="#161a23" strokeWidth="2.5" />
            </pattern>

            {/* Restrained Glow Filters */}
            <filter id="softLaserCyan" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.85" />
            </filter>
            <filter id="softLaserRose" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.85" />
            </filter>
            <filter id="softLaserAmber" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.85" />
            </filter>
            <filter id="softLaserEmerald" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.9" />
            </filter>

            {/* Subtle Gradient for Focus Rings */}
            <radialGradient id="focusGlowRose">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="focusGlowCyan">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="arrivalGlowEmerald">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* City Grid Background */}
          <rect width="1000" height="600" fill="url(#cityStreetGrid)" />

          {/* Major Arterial Corridors */}
          <path d="M -20 290 Q 220 250 440 310 T 780 270 T 1020 330" stroke="#191e28" strokeWidth="14" fill="none" />
          <path d="M 520 -20 L 520 620" stroke="#191e28" strokeWidth="12" fill="none" />
          <path d="M 120 540 L 880 120" stroke="#151921" strokeWidth="10" fill="none" />

          {/* Sector Boundaries */}
          <rect x="40" y="40" width="380" height="480" rx="6" fill="none" stroke="#06b6d4" strokeOpacity={viewState === 'focus' ? '0.04' : '0.12'} strokeDasharray="3 3" />
          <text x="50" y="65" fill="#06b6d4" fillOpacity={viewState === 'focus' ? '0.2' : '0.4'} fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
            SECTOR 1 // LOWLAND BASIN
          </text>

          <rect x="440" y="40" width="520" height="480" rx="6" fill="none" stroke="#f43f5e" strokeOpacity={viewState === 'focus' ? '0.04' : '0.12'} strokeDasharray="3 3" />
          <text x="450" y="65" fill="#f43f5e" fillOpacity={viewState === 'focus' ? '0.2' : '0.4'} fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
            SECTOR 4 // DOWNTOWN CORE
          </text>

          {/* Hazard Boundaries */}
          {showAlerts && (activeLegend === 'all' || activeLegend === 'hazards') && (
            <g className="transition-opacity duration-500">
              {HAZARDS_DATA.map((hazard) => {
                const isFocused =
                  (focusedId === 'INC-882' && hazard.id === 'HAZ-882') ||
                  (focusedId === 'INC-408' && hazard.id === 'HAZ-408') ||
                  (focusedId === 'INC-204' && hazard.id === 'HAZ-204');
                const isDimmed = viewState === 'focus' && !isFocused;

                const strokeColor =
                  hazard.severity === 'CRITICAL' ? '#f43f5e' : hazard.severity === 'WARNING' ? '#f59e0b' : '#06b6d4';

                return (
                  <g key={hazard.id} className="transition-opacity duration-500" opacity={isDimmed ? 0.15 : 1}>
                    <circle
                      cx={hazard.coords.x}
                      cy={hazard.coords.y}
                      r={hazard.radius}
                      fill={strokeColor}
                      fillOpacity={isFocused ? 0.12 : 0.04}
                      stroke={strokeColor}
                      strokeOpacity={isFocused ? 0.6 : 0.25}
                      strokeWidth={isFocused ? 1.5 : 1}
                      strokeDasharray={isFocused ? 'none' : '4 4'}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* REAL-TIME DYNAMIC EMERGENCY TRANSIT ROUTES (Traversed Solid Glow vs Remaining Dashed) */}
          {showRoutes && (activeLegend === 'all' || activeLegend === 'enroute') && (
            <g className="transition-opacity duration-500">
              {/* ROUTE 1: ENGINE-03 Hazmat Route to INC-408 Depot */}
              {(() => {
                const route = VEHICLE_ROUTES['ENG-03'];
                const sim = activeSimulations['ENG-03'];
                const progress = sim ? sim.progress : 0;
                const pos = interpolateSpline(route, progress);
                const isRelevant = focusedId === 'INC-408' || focusedId === 'ENG-03';
                const isDimmed = viewState === 'focus' && !isRelevant;

                return (
                  <g opacity={isDimmed ? 0.1 : 1} className="transition-opacity duration-500">
                    {/* Traversed segment: Solid Glowing Cyan/Emerald */}
                    {progress > 0 && (
                      <path
                        d={pos.traversedPath}
                        stroke="#06b6d4"
                        strokeWidth={isRelevant ? 3.5 : 2}
                        strokeOpacity={isRelevant ? 0.95 : 0.6}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={isRelevant ? 'url(#softLaserCyan)' : undefined}
                      />
                    )}
                    {/* Remaining segment: Dashed Flow Line */}
                    {progress < 1 && (
                      <path
                        d={pos.remainingPath}
                        stroke="#38bdf8"
                        strokeWidth={isRelevant ? 2.5 : 1.5}
                        strokeDasharray="6 6"
                        className="animate-flow-dash"
                        strokeOpacity={isRelevant ? 0.8 : 0.4}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </g>
                );
              })()}

              {/* ROUTE 2: AMB-A12 Route to INC-882 Market St. */}
              {(() => {
                const route = VEHICLE_ROUTES['AMB-A12'];
                const sim = activeSimulations['AMB-A12'];
                const progress = sim ? sim.progress : 0.58;
                const pos = interpolateSpline(route, progress);
                const isRelevant = focusedId === 'INC-882' || focusedId === 'AMB-A12';
                const isDimmed = viewState === 'focus' && !isRelevant;

                return (
                  <g opacity={isDimmed ? 0.1 : 1} className="transition-opacity duration-500">
                    {/* Traversed segment: Solid Amber Glow */}
                    {progress > 0 && (
                      <path
                        d={pos.traversedPath}
                        stroke="#fbbf24"
                        strokeWidth={isRelevant ? 3.5 : 2}
                        strokeOpacity={isRelevant ? 0.95 : 0.6}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={isRelevant ? 'url(#softLaserAmber)' : undefined}
                      />
                    )}
                    {/* Remaining segment: Dashed Flow Line */}
                    {progress < 1 && (
                      <path
                        d={pos.remainingPath}
                        stroke="#ffffff"
                        strokeWidth={isRelevant ? 2 : 1.2}
                        strokeDasharray="6 6"
                        className="animate-flow-dash"
                        strokeOpacity={isRelevant ? 0.8 : 0.35}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </g>
                );
              })()}

              {/* ROUTE 3: AMB-C08 Heavy Rescue Route to Market St. */}
              {(() => {
                const route = VEHICLE_ROUTES['AMB-C08'];
                const sim = activeSimulations['AMB-C08'];
                const progress = sim ? sim.progress : 1.0;
                const pos = interpolateSpline(route, progress);
                const isRelevant = focusedId === 'INC-882' || focusedId === 'AMB-C08';
                const isDimmed = viewState === 'focus' && !isRelevant;

                return (
                  <g opacity={isDimmed ? 0.1 : 1} className="transition-opacity duration-500">
                    <path
                      d={pos.traversedPath}
                      stroke="#10b981"
                      strokeWidth={isRelevant ? 3.5 : 2}
                      strokeOpacity={isRelevant ? 0.95 : 0.5}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter={isRelevant ? 'url(#softLaserEmerald)' : undefined}
                    />
                  </g>
                );
              })()}
            </g>
          )}

          {/* SVG Ripple Rings & Arrival Halos */}
          {viewState === 'focus' && focusedId && (
            <g>
              {focusedType === 'incident' && INCIDENTS_DATA[focusedId] && (
                <circle
                  cx={INCIDENTS_DATA[focusedId].coords.x}
                  cy={INCIDENTS_DATA[focusedId].coords.y}
                  r="60"
                  fill="url(#focusGlowRose)"
                  className="animate-pulse pointer-events-none"
                />
              )}
              {focusedType === 'vehicle' && (
                <circle
                  cx={(() => {
                    const route = VEHICLE_ROUTES[focusedId];
                    const sim = activeSimulations[focusedId];
                    return route && sim ? interpolateSpline(route, sim.progress).x : VEHICLES_DATA[focusedId]?.coords.x || 0;
                  })()}
                  cy={(() => {
                    const route = VEHICLE_ROUTES[focusedId];
                    const sim = activeSimulations[focusedId];
                    return route && sim ? interpolateSpline(route, sim.progress).y : VEHICLES_DATA[focusedId]?.coords.y || 0;
                  })()}
                  r="50"
                  fill="url(#focusGlowCyan)"
                  className="animate-pulse pointer-events-none"
                />
              )}
            </g>
          )}

          {/* Arrival Pulse when Engine-03 reaches Depot */}
          {activeSimulations['ENG-03']?.status === 'ON_SCENE' && (
            <g>
              <circle
                cx={INCIDENTS_DATA['INC-408'].coords.x}
                cy={INCIDENTS_DATA['INC-408'].coords.y}
                r="70"
                fill="url(#arrivalGlowEmerald)"
                className="animate-pulse pointer-events-none"
              />
              <circle
                cx={INCIDENTS_DATA['INC-408'].coords.x}
                cy={INCIDENTS_DATA['INC-408'].coords.y}
                r="38"
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                className="animate-ping pointer-events-none"
              />
            </g>
          )}
        </svg>

        {/* 2. Interactive DOM Markers (Precision Decluttered Overlay with Real-Time Movement) */}

        {/* INCIDENT MARKERS */}
        {Object.values(INCIDENTS_DATA).map((inc) => {
          const isSelected = focusedId === inc.id;
          const isDimmed = isElementDimmed(inc.id, inc.assignedUnits.map((u) => u.id));
          const matchesFilter = matchesGlobalFilter('incident', inc);

          return (
            <div
              key={inc.id}
              onClick={() => focusOnIncident(inc.id)}
              onMouseEnter={() =>
                setHoveredItem({
                  id: inc.id,
                  label: `${inc.code} · ${inc.title}`,
                  coords: inc.coords,
                })
              }
              onMouseLeave={() => setHoveredItem(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 select-none ${
                isSelected ? 'z-30 scale-125' : 'hover:scale-110 z-20'
              } ${isDimmed || !matchesFilter ? 'opacity-15 pointer-events-none' : 'opacity-100'}`}
              style={{
                left: `${(inc.coords.x / 1000) * 100}%`,
                top: `${(inc.coords.y / 600) * 100}%`,
              }}
            >
              {/* Expanding Ripple Ring on Active Target */}
              {isSelected && (
                <div className="absolute -inset-5 rounded-full border-2 border-rose-500 animate-focus-ripple pointer-events-none" />
              )}

              {/* Minimalist Incident Capsule */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all shadow-lg ${
                  isSelected
                    ? 'bg-rose-950 border-2 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.8)]'
                    : 'bg-[#12080a]/90 backdrop-blur-md border border-rose-500/50 text-rose-300 hover:border-rose-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span className="tracking-tight">{inc.code}</span>
                {viewState === 'overview' && (
                  <span className="text-[9px] text-rose-400/80 font-normal">· {inc.type}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* REAL-TIME MOVING VEHICLE MARKERS */}
        {Object.values(VEHICLES_DATA).map((veh) => {
          const isSelected = focusedId === veh.id;
          const isDimmed = isElementDimmed(veh.id, [veh.assignedIncidentId]);
          const matchesFilter = matchesGlobalFilter('vehicle', veh);

          // Get Real-Time Interpolated Coordinates from Simulation State
          const route = VEHICLE_ROUTES[veh.id];
          const sim = activeSimulations[veh.id];
          const pos = route && sim ? interpolateSpline(route, sim.progress) : { x: veh.coords.x, y: veh.coords.y, headingAngle: 0 };

          const isALS = veh.id === 'AMB-A12';
          const isOnScene = sim?.status === 'ON_SCENE' || veh.status === 'ON_SCENE';
          const isEngine = veh.id === 'ENG-03';

          const borderColor = isOnScene
            ? 'border-emerald-400 shadow-[0_0_15px_#10b981]'
            : isALS
            ? 'border-amber-400 shadow-[0_0_15px_#f59e0b]'
            : 'border-cyan-400 shadow-[0_0_18px_#06b6d4]';

          const textColor = isOnScene ? 'text-emerald-400' : isALS ? 'text-amber-400' : 'text-cyan-400';

          return (
            <div
              key={veh.id}
              onClick={() => focusOnVehicle(veh.id)}
              onMouseEnter={() =>
                setHoveredItem({
                  id: veh.id,
                  label: `${veh.callsign} · ${sim?.status || veh.statusLabel}`,
                  coords: pos,
                })
              }
              onMouseLeave={() => setHoveredItem(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 select-none ${
                isSelected ? 'z-30 scale-125' : 'hover:scale-110 z-20'
              } ${isDimmed || !matchesFilter ? 'opacity-15 pointer-events-none' : 'opacity-100'}`}
              style={{
                left: `${(pos.x / 1000) * 100}%`,
                top: `${(pos.y / 600) * 100}%`,
              }}
            >
              {/* Expanding Ripple Ring on Active Vehicle Target */}
              {isSelected && (
                <div className="absolute -inset-4 rounded-full border-2 border-cyan-400 animate-focus-ripple pointer-events-none" />
              )}

              {/* Real-time Moving Pulse when En Route */}
              {sim?.status === 'EN_ROUTE' && (
                <div className="absolute -inset-2 rounded-full border border-cyan-400/50 animate-ping pointer-events-none" />
              )}

              {/* Minimalist Unit Glyph Badge with Heading Direction */}
              <div
                className={`w-8 h-8 rounded-xl bg-[#0e121a]/95 backdrop-blur-md border-2 ${borderColor} flex items-center justify-center ${textColor} transition-all`}
                style={{
                  transform: `rotate(${pos.headingAngle}deg)`,
                }}
              >
                {isALS && <Ambulance className="w-4 h-4" />}
                {isOnScene && <Shield className="w-4 h-4" />}
                {isEngine && <Flame className="w-4 h-4" />}
              </div>

              {/* Clean Sub-Label Pill with live ETA */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-black/85 border border-white/10 text-[8px] font-mono font-semibold text-zinc-300 whitespace-nowrap shadow-md flex items-center gap-1">
                <span>{veh.id}</span>
                {sim?.status === 'EN_ROUTE' && (
                  <span className="text-cyan-400">· {sim.etaMinutes}m</span>
                )}
                {sim?.status === 'ON_SCENE' && (
                  <span className="text-emerald-400">· On Scene</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Hover Tooltip */}
        {hoveredItem && viewState === 'overview' && (
          <div
            className="absolute -translate-x-1/2 -translate-y-12 z-40 px-2.5 py-1 rounded-lg bg-[#0e1117]/95 border border-white/20 text-[10px] font-mono text-white shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
            style={{
              left: `${(hoveredItem.coords.x / 1000) * 100}%`,
              top: `${(hoveredItem.coords.y / 600) * 100}%`,
            }}
          >
            {hoveredItem.label}
          </div>
        )}
      </div>

      {/* 3. Top Navigation & Breadcrumb Header */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        {viewState === 'focus' ? (
          <div className="flex items-center gap-2 bg-[#12151c]/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 shadow-xl animate-in fade-in slide-in-from-left-2 duration-300">
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-md active:scale-95"
              title="Return to full city overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Overview</span>
            </button>
            <span className="text-zinc-600 text-xs">/</span>
            <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[180px]">
              {focusedType === 'incident' && currentIncident ? currentIncident.code : ''}
              {focusedType === 'vehicle' && currentVehicle ? currentVehicle.callsign : ''}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-[#12151c]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg text-xs">
            <button
              onClick={() => setActiveLegend('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeLegend === 'all' ? 'bg-zinc-700/80 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveLegend('enroute')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeLegend === 'enroute' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>En Route</span>
            </button>
            <button
              onClick={() => setActiveLegend('onscene')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeLegend === 'onscene' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>On Scene</span>
            </button>
            <button
              onClick={() => setActiveLegend('hazards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeLegend === 'hazards' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Hazards</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Top Right: 3D Compass & Quick Tools */}
      <div className="absolute top-4 right-4 z-30 flex items-start gap-2">
        <CompassWidget heading={315} headingLabel="NW" />

        <div className="flex flex-col gap-1.5 bg-[#12151c]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl text-zinc-400">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="w-7 h-7 rounded-xl hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.8))}
            className="w-7 h-7 rounded-xl hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleBackToOverview}
            className="w-7 h-7 rounded-xl hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
            title="Reset to Overview"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. FLOATING DETAIL PANEL (Progressive Disclosure) */}
      {viewState === 'focus' && (
        <div className="absolute top-4 right-16 bottom-4 w-84 sm:w-96 max-w-[calc(100%-2rem)] z-40 bg-[#0e1117]/95 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-6 duration-300 text-white">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                  focusedType === 'incident' && currentIncident?.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {focusedType === 'incident' ? currentIncident?.code : currentVehicle?.id}
              </span>
              <span className="text-xs font-semibold text-zinc-300 truncate">
                {focusedType === 'incident' ? currentIncident?.type : currentVehicle?.tier}
              </span>
            </div>

            <button
              onClick={handleBackToOverview}
              className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              title="Close panel and return to overview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto tactical-scrollbar p-5 space-y-4 text-xs">
            {/* INCIDENT DETAIL CONTENT */}
            {focusedType === 'incident' && currentIncident && (
              <>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {currentIncident.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>
                      {currentIncident.location} · {currentIncident.sector}
                    </span>
                  </div>
                </div>

                {/* Vital Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Status</span>
                    <span className="font-semibold text-rose-400 font-mono text-[11px]">
                      {currentIncident.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Primary Unit</span>
                    <span className="font-semibold text-cyan-300 font-mono text-[11px]">
                      {currentIncident.leadUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Est. Arrival</span>
                    <span className="font-semibold text-emerald-400 font-mono text-[11px]">
                      {currentIncident.eta}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Casualties</span>
                    <span className="font-semibold text-amber-300 text-[11px]">
                      6 Reported (4 Trapped)
                    </span>
                  </div>
                </div>

                {/* Progressively Disclosed Accordions */}
                <div className="space-y-2 pt-1">
                  {/* Timeline */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    <button
                      onClick={() => setExpandedSection((curr) => (curr === 'timeline' ? 'none' : 'timeline'))}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-semibold text-zinc-200 text-xs">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Incident Timeline ({currentIncident.timeline.length})</span>
                      </div>
                      {expandedSection === 'timeline' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>

                    {expandedSection === 'timeline' && (
                      <div className="px-4 pb-3.5 pt-1 space-y-2.5 border-t border-white/5 text-[11px]">
                        {currentIncident.timeline.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                step.status === 'completed'
                                  ? 'bg-emerald-400'
                                  : step.status === 'active'
                                  ? 'bg-cyan-400 animate-pulse'
                                  : 'bg-zinc-600'
                              }`}
                            />
                            <div>
                              <span className="font-mono text-[10px] text-zinc-400 block">{step.time}</span>
                              <p className="text-zinc-200 leading-snug">{step.event}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assigned Units */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    <button
                      onClick={() => setExpandedSection((curr) => (curr === 'units' ? 'none' : 'units'))}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-semibold text-zinc-200 text-xs">
                        <Ambulance className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Assigned Units ({currentIncident.assignedUnits.length})</span>
                      </div>
                      {expandedSection === 'units' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>

                    {expandedSection === 'units' && (
                      <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-white/5 text-[11px]">
                        {currentIncident.assignedUnits.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => focusOnVehicle(u.id)}
                            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-zinc-100 block">{u.name}</span>
                              <span className="text-[10px] text-zinc-400">{u.role}</span>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                                u.status === 'On Scene' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                              }`}
                            >
                              {u.eta}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Risks */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    <button
                      onClick={() => setExpandedSection((curr) => (curr === 'risks' ? 'none' : 'risks'))}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-semibold text-zinc-200 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Risk Details & Perimeter Hazards</span>
                      </div>
                      {expandedSection === 'risks' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>

                    {expandedSection === 'risks' && (
                      <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-white/5 text-[11px]">
                        {currentIncident.risks.map((risk, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <p className="text-zinc-300 leading-relaxed">{risk}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    <button
                      onClick={() => setExpandedSection((curr) => (curr === 'actions' ? 'none' : 'actions'))}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-semibold text-zinc-200 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        <span>Recommended Tactical Actions</span>
                      </div>
                      {expandedSection === 'actions' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>

                    {expandedSection === 'actions' && (
                      <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-white/5 text-[11px]">
                        {currentIncident.actions.map((act, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                            <p className="text-zinc-300 leading-relaxed">{act}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* VEHICLE DETAIL CONTENT */}
            {focusedType === 'vehicle' && currentVehicle && (
              <>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {currentVehicle.callsign}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {currentVehicle.model} · {currentVehicle.tier}
                    </span>
                  </div>
                </div>

                {/* Vital Metrics Grid reflecting Real-Time Simulation State */}
                {(() => {
                  const sim = activeSimulations[currentVehicle.id];
                  const liveEta = sim ? (sim.status === 'ON_SCENE' ? 'Arrived' : `~${sim.etaMinutes} min`) : currentVehicle.eta;
                  const liveSpeed = sim ? `${sim.speedKmH} km/h` : currentVehicle.speed;
                  const liveDistance = sim ? `${sim.distanceRemainingKm} km` : currentVehicle.fuel;
                  const liveStatus = sim ? (sim.status === 'ON_SCENE' ? 'On Scene' : sim.status === 'ARRIVING' ? 'Arriving' : 'En Route') : currentVehicle.statusLabel;

                  return (
                    <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Status</span>
                        <span className="font-semibold text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          {liveStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Est. Arrival</span>
                        <span className="font-semibold text-emerald-400 font-mono text-[11px]">{liveEta}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Live Speed</span>
                        <span className="font-semibold text-zinc-200 font-mono text-[11px]">{liveSpeed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Distance Rem.</span>
                        <span className="font-semibold text-amber-300 font-mono text-[11px]">{liveDistance}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Assigned Mission Destination */}
                <div
                  onClick={() => focusOnIncident(currentVehicle.assignedIncidentId)}
                  className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/60 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] text-rose-400 uppercase font-mono block">Target Incident</span>
                    <span className="font-bold text-white text-xs">
                      {currentVehicle.assignedIncidentId} · {INCIDENTS_DATA[currentVehicle.assignedIncidentId]?.title || 'Disaster Epicenter'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-300 underline">View Incident</span>
                </div>

                {/* Equipment Manifest */}
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                  <div className="px-4 py-2.5 font-semibold text-zinc-200 text-xs border-b border-white/5 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Medical / Hazmat Equipment Readiness</span>
                  </div>
                  <div className="p-3.5 space-y-2 text-[11px]">
                    {currentVehicle.equipment.map((eq, idx) => (
                      <div key={idx} className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-zinc-100 block">{eq.name}</span>
                          <span className="text-[10px] text-zinc-400">{eq.detail}</span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {eq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crew Details */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Assigned Crew</span>
                  <span className="font-semibold text-zinc-200 mt-0.5 block">{currentVehicle.crew}</span>
                </div>
              </>
            )}
          </div>

          {/* Panel Action Footer (Zero browser alert!) */}
          <div className="p-3.5 border-t border-white/10 bg-white/[0.02] flex items-center gap-2">
            <button
              onClick={() =>
                addNotification({
                  title: 'TACTICAL RADIO FREQUENCY ACTIVE',
                  message: `Encrypted push-to-talk channel opened with ${focusedId}. Dispatch link synchronized.`,
                  type: 'info',
                })
              }
              className="flex-1 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Radio Comms</span>
            </button>
            <button
              onClick={handleBackToOverview}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-semibold text-xs transition-all"
            >
              Reset View
            </button>
          </div>
        </div>
      )}

      {/* 6. Floating Emergency Call Status Badge */}
      {showEmergencyCall && (
        <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#141528]/90 backdrop-blur-md border border-indigo-500/30 text-white shadow-xl animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold">911 Dispatch Live: #911-39</span>
        </div>
      )}

      {/* 7. Bottom Status Hint Bar */}
      <div className="absolute bottom-2.5 left-4 right-4 z-20 flex items-center justify-between text-[10px] text-zinc-500 font-mono pointer-events-none px-2">
        <span>
          {viewState === 'overview'
            ? 'Click any incident marker or response unit to inspect telemetry · Live GPS Simulation'
            : 'Focus active · Real-time vehicle navigation tracking'}
        </span>
        <span>Cartography: Vector Tactical Grid</span>
      </div>
    </div>
  );
};
