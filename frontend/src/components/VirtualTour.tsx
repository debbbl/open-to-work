import React, { useEffect, useRef, useState } from 'react';
import { Camera, Users, Coffee, Building, Maximize2, Info, Navigation, HelpCircle } from 'lucide-react';

interface VirtualTourProps {
  onLocationChange?: (location: string) => void;
  fullscreen?: boolean;
  active?: boolean; // ← tell the viewer when it’s actually visible
}

/** Extend window for TypeScript */
declare global {
  interface Window {
    Marzipano: any;
    APP_DATA: any;
    __vt_switch?: (id: string) => void;
  }
}

/** helper: wait until an element has non-zero size, then fire cb */
function whenSized(el: HTMLElement, cb: () => void) {
  if (el.clientWidth > 0 && el.clientHeight > 0) return cb();
  const ro = new ResizeObserver(() => {
    if (el.clientWidth > 0 && el.clientHeight > 0) {
      ro.disconnect();
      cb();
    }
  });
  ro.observe(el);
}

/** helper: load a script once and await it */
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if ([...document.scripts].some(s => s.src.includes(src))) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

const VirtualTour: React.FC<VirtualTourProps> = ({
  onLocationChange,
  fullscreen = false,
  active = true,   // default true for standalone usage
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  // keep refs so we can clean up properly on remounts / tab switches
  const viewerInstance = useRef<any | null>(null);
  const sceneMapRef = useRef<Record<string, any>>({});

  const [currentLocation, setCurrentLocation] = useState('lobby');
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [selectedTooltip, setSelectedTooltip] = useState<string | null>(null);

  const locations = [
    {
      id: 'lobby',
      name: 'Reception',
      icon: Building,
      description: 'Main entrance and reception area',
      tooltip: 'This is the primary entry point where visitors arrive and check in.'
    },
    {
      id: 'office',
      name: 'Workspace',
      icon: Users,
      description: 'Workspace and pantry',
      tooltip: 'Open collaborative workspace with hot-desking options, quiet zones, and a pantry for refreshments.'
    },
    {
      id: 'printer',
      name: 'Printer Area',
      icon: Coffee,
      description: 'Printing and supply station',
      tooltip: 'Multi-function printers and office supplies are located here.'
    },
  ];


  const navigationTips = [
    { icon: '🖱️', text: 'Click and drag to look around' },
    { icon: '🔍', text: 'Scroll to zoom in/out' },
    { icon: '📱', text: 'Use touch gestures on mobile' },
    // { icon: '🎯', text: 'Click location buttons to navigate' }
  ];

  // Load marzipano + data once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        await loadScript('/virtual-tour/marzipano.js');
        await loadScript('/virtual-tour/data.js');

        if (cancelled) return;
        if (!window.Marzipano) throw new Error('window.Marzipano missing');
        if (!window.APP_DATA) throw new Error('window.APP_DATA missing');

        setIsLoading(false);
      } catch (e) {
        console.error('[virtual-tour] boot error:', e);
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Create viewer when:
  // - we’re active (visible),
  // - scripts are present,
  // - and no viewer exists yet
  useEffect(() => {
    if (!active) return;
    if (!window.Marzipano || !window.APP_DATA) return;
    if (viewerInstance.current) return;
    initMarzipanoViewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isLoading]);

  // Optional: tear down when becoming inactive (e.g., switching tabs)
  useEffect(() => {
    if (active) return;
    teardown();
  }, [active]);

  const teardown = () => {
    window.__vt_switch = undefined;
    sceneMapRef.current = {};
    const v = viewerInstance.current;
    if (v && (v as any).__cleanup) (v as any).__cleanup();
    viewerInstance.current = null;
    if (viewerRef.current) viewerRef.current.innerHTML = '';
  };

  const initMarzipanoViewer = () => {
    const host = viewerRef.current;
    if (!host) return;

    // give the container a height immediately so layouts can compute
    host.style.minHeight = fullscreen ? '100vh' : '36rem';
    host.style.width = '100%';
    host.innerHTML = '';

    // read settings from data.js (with sensible defaults)
    const settings = window.APP_DATA?.settings || {};
    const autorotateEnabled = settings.autorotateEnabled ?? true;
    const autorotateDisableOnInteraction = settings.autorotateDisableOnInteraction ?? true;
    const autorotateDelayMs = settings.autorotateDelayMs ?? 3000;
    const yawSpeed = settings.autorotateYawSpeed ?? 0.03; // rad/s

    // wait until the element is actually visible/sized
    whenSized(host, () => {
      // if we already had a viewer (remount), tear it down
      const existing = viewerInstance.current;
      if (existing && (existing as any).__cleanup) (existing as any).__cleanup();

      const M = window.Marzipano;
      const viewer = new M.Viewer(host);
      viewerInstance.current = viewer;

      // -------- Autorotate wiring --------
      let idleTimer: any = null;
      const autorotate = M.autorotate({
        yawSpeed,
        targetPitch: 0,
        targetFov: Math.PI / 2
      });

      const startAuto = () => {
        viewer.startMovement(autorotate);
        viewer.setIdleMovement(autorotateDelayMs, autorotate);
      };
      const stopAuto = () => {
        viewer.stopMovement();
        viewer.setIdleMovement(Infinity);
      };
      const pokeUserActivity = () => {
        if (!autorotateDisableOnInteraction) return;
        stopAuto();
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (autorotateEnabled) startAuto();
        }, autorotateDelayMs);
      };

      const onVisibility = () => {
        if (document.hidden) stopAuto();
        else if (autorotateEnabled) startAuto();
      };
      document.addEventListener('visibilitychange', onVisibility);

      // Pause autorotate on user input
      const userEvents = ['pointerdown', 'pointermove', 'wheel', 'touchstart', 'keydown'];
      userEvents.forEach(ev => host.addEventListener(ev, pokeUserActivity as any, { passive: true }));

      // -------- Resize handling --------
      const ro = new ResizeObserver(() => viewer.resize());
      ro.observe(host);
      const onWinResize = () => viewer.resize();
      window.addEventListener('resize', onWinResize);

      // Allow cleanup later
      (viewer as any).__cleanup = () => {
        try { ro.disconnect(); } catch {}
        window.removeEventListener('resize', onWinResize);
        document.removeEventListener('visibilitychange', onVisibility);
        userEvents.forEach(ev => host.removeEventListener(ev, pokeUserActivity as any));
        if (idleTimer) clearTimeout(idleTimer);
        stopAuto();
      };

      // -------- Build scenes --------
      const sceneMap: Record<string, any> = {};
      const scenes = (window.APP_DATA?.scenes ?? []) as any[];

      scenes.forEach((sceneData) => {
        const url = `/virtual-tour/assets/${sceneData.id}.jpeg`;

        // tiny probe for wrong paths during dev
        const probe = new Image();
        probe.onerror = () => console.warn('[virtual-tour] 404 image', url);
        probe.src = url;

        const source = M.ImageUrlSource.fromString(url);
        const geometry = new M.EquirectGeometry([{ width: 4000 }]); // 4k works well
        const limiter = M.RectilinearView.limit.traditional(
          4096,                   // face size cap
          100 * Math.PI / 180,    // max FOV
          120 * Math.PI / 180     // max pitch
        );
        const view = new M.RectilinearView(
          sceneData.initialViewParameters || { yaw: 0, pitch: 0, fov: Math.PI / 2 },
          limiter
        );
        const scene = viewer.createScene({ source, geometry, view, pinFirstLevel: true });

        // optional hotspots from data.js
        // (sceneData.hotSpots ?? []).forEach((h: any) => {
        //   const el = createHotspotElement(h);
        //   scene.hotspotContainer().createHotspot(el, { yaw: h.yaw, pitch: h.pitch });
        // });

        sceneMap[sceneData.id] = scene;
      });

      sceneMapRef.current = sceneMap;

      // global debug/imperative switcher
      window.__vt_switch = (id: string) => {
        const s = sceneMapRef.current[id];
        if (!s) return console.error('[virtual-tour] scene not found:', id);
        stopAuto();
        s.switchTo({ transitionDuration: 800 });
        if (autorotateEnabled) setTimeout(() => startAuto(), 900);
      };

      // show an initial scene now that we know we have size
      const initial = sceneMap['lobby'] ? 'lobby' : Object.keys(sceneMap)[0];
      if (initial) {
        window.__vt_switch(initial);
        setCurrentLocation(initial);
      }

      // Start autorotate if enabled
      if (autorotateEnabled) startAuto();
    });
  };

  // create a simple “info/link” hotspot element (used if your data.js has hotSpots)
  const createHotspotElement = (hotspot: any) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    const base = document.createElement('div');
    base.style.background = hotspot.type === 'link' ? 'rgba(16,185,129,0.9)' : 'rgba(59,130,246,0.9)';
    base.style.color = '#fff';
    base.style.padding = '8px 12px';
    base.style.borderRadius = '20px';
    base.style.fontSize = '12px';
    base.style.fontWeight = '600';
    base.style.cursor = 'pointer';
    base.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    base.style.backdropFilter = 'blur(4px)';
    base.style.border = '2px solid rgba(255,255,255,0.3)';
    base.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

    base.textContent = hotspot.text || (hotspot.type === 'link' ? 'Go' : 'Info');

    base.onmouseenter = () => {
      base.style.transform = 'scale(1.06)';
      base.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
    };
    base.onmouseleave = () => {
      base.style.transform = 'scale(1)';
      base.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    };

    base.onclick = () => {
      if (hotspot.type === 'link' && hotspot.target && typeof window.__vt_switch === 'function') {
        window.__vt_switch(hotspot.target);
        setCurrentLocation(hotspot.target);
        onLocationChange?.(hotspot.target);
      } else if (hotspot.type === 'info') {
        alert(hotspot.description || hotspot.text || 'Info');
      }
    };

    wrapper.appendChild(base);
    return wrapper;
  };

  const switchToScene = (sceneId: string) => {
    if (typeof window.__vt_switch === 'function') {
      window.__vt_switch(sceneId);
      setCurrentLocation(sceneId);
      onLocationChange?.(sceneId);
    } else {
      console.warn('[virtual-tour] switch called before init');
    }
  };

  const openFullscreen = () => {
    const url = `/virtual-tour-fullscreen.html?scene=${currentLocation}`;
    window.open(url, '_blank', 'width=1200,height=800');
  };

  const toggleTooltip = (locationId: string) => {
    setSelectedTooltip(selectedTooltip === locationId ? null : locationId);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Virtual Tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Virtual Office Tour</h3>
            <p className="text-sm text-gray-600">
              Current location: {locations.find(l => l.id === currentLocation)?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTooltips(!showTooltips)}
            className={`p-2 rounded-lg transition-colors ${showTooltips ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Toggle navigation tips"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            onClick={openFullscreen}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Open in fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="text-sm">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="relative">
        <div
          ref={viewerRef}
          className={`bg-gray-100 rounded-lg overflow-hidden shadow-lg ${fullscreen ? 'h-screen' : 'h-96'}`}
          style={{ width: '100%', height: fullscreen ? '100vh' : '24rem' }}
        />
        {showTooltips && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <Navigation className="h-4 w-4" />
              <span className="text-sm font-medium">Navigation Tips</span>
            </div>
            <div className="space-y-1 text-xs">
              {navigationTips.map((tip, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location buttons */}
      <div className="grid grid-cols-3 gap-4 overflow-visible">
        {locations.map((loc) => {
          const Icon = loc.icon;
          const activeBtn = currentLocation === loc.id;
          return (
            <div key={loc.id} className="relative p-1">
              <button
                onClick={() => switchToScene(loc.id)}
                className={`w-full p-4 text-sm rounded-lg transition-transform duration-150 ${
                  activeBtn
                    ? 'bg-blue-500 text-white shadow-xl transform scale-105 relative z-10'
                    : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md text-gray-700'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">{loc.name}</div>
                <div className="text-xs opacity-75 mt-1">{loc.description}</div>
              </button>

              {/* Info button */}
              <button
                onClick={() => toggleTooltip(loc.id)}
                className="absolute top-2 right-2 p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                title="Show location info"
              >
                <Info className="h-3 w-3 text-gray-600" />
              </button>

              {/* Tooltip */}
              {selectedTooltip === loc.id && (
                <div className="absolute z-10 top-full mt-2 left-0 right-0 bg-gray-900 text-white p-3 rounded-lg text-xs shadow-lg">
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  {loc.tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>🎯 Interactive hotspots available</span>
            <span>📱 Mobile compatible</span>
            <span>🔄 360° panoramic views</span>
          </div>
          {/* <div className="text-xs opacity-75">Powered by Marzipano</div> */}
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;
