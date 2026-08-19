import { evaluatePerformance } from '../performanceChecks';

describe('Performance checks', () => {
  it('accepts metrics inside the defined thresholds', () => {
    const result = evaluatePerformance({
      startupTimeMs: 2850,
      memoryUsageMb: 145,
      fps: 58,
    });

    expect(result.performanceIssues).toEqual([]);
  });

  it('reports each metric that exceeds its threshold', () => {
    const result = evaluatePerformance({
      startupTimeMs: 4001,
      memoryUsageMb: 201,
      fps: 54,
    });

    expect(result.performanceIssues).toHaveLength(3);
    expect(result.performanceIssues).toEqual([
      'Startup time exceeds expected threshold (4s).',
      'Memory usage exceeds 200 MB threshold.',
      'Frame rate below 55 FPS.',
    ]);
  });
});
