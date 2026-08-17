import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
  console.warn("GitHub App Environment variables are missing.");
}

const appId = process.env.GITHUB_APP_ID || '12345';
const privateKey = (process.env.GITHUB_APP_PRIVATE_KEY || '').replace(/\\n/g, '\n');

/**
 * Gets an authenticated Octokit instance for a specific installation
 */
export async function getInstallationOctokit(installationId: number) {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId,
    },
  });
}

/**
 * Gets an authenticated Octokit instance for the App itself
 */
export function getAppOctokit() {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    },
  });
}

