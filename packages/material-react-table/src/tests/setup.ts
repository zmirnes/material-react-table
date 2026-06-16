// Extends vitest's expect with jest-dom matchers
// (toBeInTheDocument, toHaveTextContent, toBeVisible, etc.).
import '@testing-library/jest-dom';

// jsdom has no layout engine, so every element reports a 0-height
// getBoundingClientRect by default. @tanstack/react-virtual (used by
// MaterialReactTable's row virtualization, enabled by default) relies on
// real measurements to decide which rows are "visible" — without this,
// it computes a zero-height viewport and silently renders no rows at all,
// breaking every test that queries for row content.
// Rows (<tr>) get a small height; everything else (notably the scrollable
// table container) gets a large height so the virtualizer has a viewport
// tall enough to fit a typical test dataset.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub;
}

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: function (this: HTMLElement) {
    const height = this.tagName === 'TR' ? 50 : 600;
    return {
      bottom: height,
      height,
      left: 0,
      right: 600,
      toJSON() {},
      top: 0,
      width: 600,
      x: 0,
      y: 0,
    };
  },
});
