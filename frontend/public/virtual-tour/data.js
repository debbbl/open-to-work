// Keep IDs in sync with your filenames under /virtual-tour/assets/*.jpeg
window.APP_DATA = {
  settings: { 
    mouseViewMode: "drag",
    autorotateEnabled: true,
    autorotateDisableOnInteraction: true
  },
  scenes: [
    {
      id: "lobby",
      name: "Reception & Lobby",
      initialViewParameters: { 
        yaw: 80, 
        pitch: 0, 
        fov: Math.PI / 2 
      },
      hotSpots: [
        {
          yaw: 75,
          pitch: 0,
          type: "info",
          text: "Welcome Desk",
          description: "Our friendly reception team is here to help you"
        },
        {
          yaw: 80,
          pitch: 0,
          type: "link",
          text: "To Workspace",
          target: "office"
        }
      ]
    },
    {
      id: "office",
      name: "Workspace",
      initialViewParameters: { 
        yaw: 160, 
        pitch: -0.1, 
        fov: Math.PI / 2 
      },
      hotSpots: [
        {
          yaw: Math.PI,
          pitch: 0,
          type: "info",
          text: "Collaboration Area",
          description: "Open workspace designed for team collaboration and creativity"
        },
        {
          yaw: 0,
          pitch: 0,
          type: "info",
          text: "Pantry",
          description: "A place to grab snacks, coffee, and take short breaks"
        },
        {
          yaw: Math.PI / 1.25,
          pitch: 0,
          type: "link",
          text: "To Printer Area",
          target: "printer"
        },
        {
          yaw: Math.PI / 2.5,
          pitch: 0,
          type: "link",
          text: "Back to Lobby",
          target: "lobby"
        }
      ]
    },
    {
      id: "printer",
      name: "Printer & Coffee Area",
      initialViewParameters: { 
        yaw: Math.PI, 
        pitch: 0, 
        fov: Math.PI / 2 
      },
      hotSpots: [
        {
          yaw: 0,
          pitch: 0,
          type: "info",
          text: "Coffee Station",
          description: "Grab a coffee and connect with colleagues in this informal meeting space"
        },
        {
          yaw: Math.PI,
          pitch: 0.45,
          type: "info",
          text: "Printer & Supplies",
          description: "Multi-function printers and office supplies"
        },
        {
          yaw: Math.PI / 2,
          pitch: 0,
          type: "link",
          text: "Back to Workspace",
          target: "office"
        }
      ]
    }
  ]
};
