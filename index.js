import { registerRootComponent } from 'expo';
import App from './App';

// Silencia warnings de compatibilidad de librerías de terceros con React 19
const originalError = console.error;
console.error = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('element.ref')) return;
  originalError(...args);
};

registerRootComponent(App);
