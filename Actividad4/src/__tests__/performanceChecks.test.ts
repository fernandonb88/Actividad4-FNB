import { evaluatePerformance } from '../performanceChecks';

describe('Performance checks for the mobile app', () => {
  it('flags slow startup and high memory usage as performance issues', () => {
    const result = evaluatePerformance({
      startupTimeMs: 4800,
      memoryUsageMb: 230,
      fps: 60,
    });

    expect(result.performanceIssues).toContain('Startup time exceeds expected threshold (4s).');
    expect(result.performanceIssues).toContain('Memory usage exceeds 200 MB threshold.');
  });

  it('accepts normal performance metrics without warnings', () => {
    const result = evaluatePerformance({
      startupTimeMs: 2500,
      memoryUsageMb: 150,
      fps: 60,
    });

    expect(result.performanceIssues).toEqual([]);
  });
});
