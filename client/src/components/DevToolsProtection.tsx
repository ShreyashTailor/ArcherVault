import { useEffect, useState } from "react";

export default function DevToolsProtection() {
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) ||
        (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) ||
        (e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c')) ||
        (e.metaKey && (e.key === 'U' || e.key === 'u')) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        e.stopPropagation();
        setDevToolsOpen(true);
        return false;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.keyCode === 123) {
        e.preventDefault();
        setDevToolsOpen(true);
        return false;
      }
    };

    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        setDevToolsOpen(true);
      }
    };

    const devToolsChecker = () => {
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function() {
          setDevToolsOpen(true);
          throw new Error('DevTools detected');
        }
      });
      console.log(element);
      console.clear();
    };

    const checkDebugger = () => {
      const before = new Date().getTime();
      debugger;
      const after = new Date().getTime();
      if (after - before > 100) {
        setDevToolsOpen(true);
      }
    };

    const disableDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const disableCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keypress', handleKeyPress, true);
    document.addEventListener('dragstart', disableDrag);
    document.addEventListener('copy', disableCopy);
    document.addEventListener('cut', disableCopy);
    
    const detectInterval = setInterval(detectDevTools, 1000);
    const debugInterval = setInterval(checkDebugger, 2000);
    const consoleInterval = setInterval(devToolsChecker, 1000);

    detectDevTools();

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keypress', handleKeyPress, true);
      document.removeEventListener('dragstart', disableDrag);
      document.removeEventListener('copy', disableCopy);
      document.removeEventListener('cut', disableCopy);
      clearInterval(detectInterval);
      clearInterval(debugInterval);
      clearInterval(consoleInterval);
    };
  }, []);

  if (devToolsOpen) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          color: '#ff0000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          fontFamily: 'monospace',
          fontSize: '24px',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>WARNING</div>
        <div style={{ fontSize: '18px', maxWidth: '600px' }}>
          Inspect Element is not allowed on this website.
          <br /><br />
          Developer tools have been disabled for security reasons.
          <br /><br />
          Please close developer tools and refresh the page.
        </div>
      </div>
    );
  }

  return null;
}
