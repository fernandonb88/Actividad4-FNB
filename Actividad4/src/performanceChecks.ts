export type PerformanceSummary = {
  startupTimeMs: number;
  memoryUsageMb: number;
  fps: number;
};

export function evaluatePerformance(metrics: PerformanceSummary) {
  const results = {
    startupTimeMs: metrics.startupTimeMs,
    memoryUsageMb: metrics.memoryUsageMb,
    fps: metrics.fps,
    performanceIssues: [] as string[],
  };

  if (metrics.startupTimeMs > 4000) {
    results.performanceIssues.push('Startup time exceeds expected threshold (4s).');
  }

  if (metrics.memoryUsageMb > 200) {
    results.performanceIssues.push('Memory usage exceeds 200 MB threshold.');
  }

  if (metrics.fps < 55) {
    results.performanceIssues.push('Frame rate below 55 FPS.');
  }

  return results;
}
