import { describe, it, expect } from 'vitest';
import { generatePNR } from '../../utils/pnrGenerator.js';

describe('Unit Tests: PNR Generation', () => {
  it('should generate a PNR starting with YS followed by 8 alphanumeric characters', () => {
    const pnr = generatePNR();
    expect(pnr).toBeDefined();
    expect(typeof pnr).toBe('string');
    expect(pnr.length).toBe(10);
    expect(pnr.startsWith('YS')).toBe(true);
    expect(/^YS[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(pnr)).toBe(true);
  });

  it('should generate unique PNRs on subsequent calls', () => {
    const set = new Set();
    for (let i = 0; i < 100; i++) {
      set.add(generatePNR());
    }
    expect(set.size).toBe(100);
  });
});

