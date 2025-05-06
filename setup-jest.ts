import 'jest-preset-angular/setup-jest';
import '@angular/common/testing';
import '@angular/core/testing';
import '@angular/platform-browser/testing';
import '@angular/platform-browser-dynamic/testing';

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance'],
  }),
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => ({
    enumerable: true,
    configurable: true,
  }),
}); 