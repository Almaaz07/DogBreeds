jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createMockIcon = (name) => {
    const Component = (props) => React.createElement(View, { testID: `icon-${name}`, ...props });
    Component.displayName = name;
    return Component;
  };
  return new Proxy({}, {
    get: (_, prop) => createMockIcon(prop),
  });
});

if (typeof window !== 'undefined' && !window.dispatchEvent) {
  window.dispatchEvent = jest.fn();
}
