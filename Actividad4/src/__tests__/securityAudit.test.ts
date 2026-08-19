import fs from 'fs';
import path from 'path';

describe('Static security audit of the application service', () => {
  const servicePath = path.resolve(__dirname, '../../../src/services/taskService.ts');
  const serviceSource = fs.readFileSync(servicePath, 'utf8');

  it('uses HTTPS for the configured API endpoint', () => {
    expect(serviceSource).toContain("const API_URL = 'https://api.taskmanager.com';");
    expect(serviceSource).not.toMatch(/http:\/\//);
  });

  it('does not persist credentials or use insecure storage in the service', () => {
    expect(serviceSource).not.toMatch(/AsyncStorage|password|authToken|refreshToken|apiKey/);
  });
});
