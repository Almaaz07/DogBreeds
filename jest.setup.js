/* eslint-env jest */
const mockDb = {
  transaction: jest.fn(async cb => {
    const tx = {
      execute: jest.fn(() => Promise.resolve({ rows: [], rowsAffected: 0 })),
    };
    return cb(tx);
  }),
  execute: jest.fn(() =>
    Promise.resolve({
      rows: [],
      rowsAffected: 0,
      insertId: 0,
    })
  ),
  executeSync: jest.fn(() => ({
    rows: [],
    rowsAffected: 0,
    insertId: 0,
  })),
  close: jest.fn(),
  closeAsync: jest.fn(() => Promise.resolve()),
};

jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => mockDb),
  openAsync: jest.fn(() => Promise.resolve(mockDb)),
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
    const Component = (props) =>
      React.createElement(View, { testID: `icon-${name}`, ...props });
    Component.displayName = name;
    return Component;
  };
  return new Proxy(
    {},
    {
      get: (_, prop) => createMockIcon(prop),
    }
  );
});

if (typeof window !== 'undefined' && !window.dispatchEvent) {
  window.dispatchEvent = jest.fn();
}
