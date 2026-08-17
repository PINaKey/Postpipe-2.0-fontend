import { connectDB } from '@/lib/server-db';
import { getInstallationOctokit } from '@/lib/github/octokit';
import { Octokit } from '@octokit/rest';

const TEMPLATE_OWNER = 'PostPipe';
const TEMPLATES: Record<string, string> = {
  express: 'postpipe-connector-template',
  fastapi: 'postpipe-connector-fastapi',
  js: 'postpipe-connector-template' // For legacy support if needed
};

// Files and directories that PostPipe manages and will automatically update
const MANAGED_PATHS: Record<string, string[]> = {
  express: [
    'package.json',
    'package-lock.json',
    '.github/',
    'api/',
    'vercel.json',
    'Dockerfile',
    'README.md'
  ],
  fastapi: [
    'requirements.txt',
    'app/',
    'api/',
    '.github/',
    'vercel.json',
    'Dockerfile',
    'README.md'
  ],
  js: [
    'package.json',
    'package-lock.json',
    '.github/',
    'api/',
    'vercel.json',
    'Dockerfile',
    'README.md'
  ]
};

function isManagedPath(path: string, type: string): boolean {
  const managed = MANAGED_PATHS[type] || [];
  return managed.some(mp => path === mp || path.startsWith(mp));
}

export class TemplateUpdateService {
  /**
   * Propagates a template update to all generated repositories of a specific type.
   */
  static async propagateUpdate(type: string, newVersion: string) {
    if (type === 'js') type = 'express'; // normalize
    const templateRepoName = TEMPLATES[type];
    if (!templateRepoName) {
      throw new Error(`Unknown template type: ${type}`);
    }

    const db = await connectDB();
    
    // Find eligible repositories
    const connectors = await db.collection('github_connectors').find({
      type: { $in: [type, type === 'express' ? 'js' : type] },
      autoUpdateEnabled: { $ne: false } // undefined counts as true
    }).toArray();

    if (connectors.length === 0) {
      console.log(`No connectors found for type ${type}`);
      return { success: true, updated: 0, failed: 0 };
    }

    // 1. Fetch template files (Once)
    // Using a public API call (no auth needed for public repo) to get the template tree
    const publicOctokit = new Octokit(); // Unauthenticated for public repo
    let templateTreeItems: any[] = [];
    
    try {
      // Get the default branch commit
      const { data: branchData } = await publicOctokit.request('GET /repos/{owner}/{repo}/branches/main', {
        owner: TEMPLATE_OWNER,
        repo: templateRepoName
      });
      const templateCommitSha = branchData.commit.sha;

      // Get recursive tree
      const { data: treeData } = await publicOctokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
        owner: TEMPLATE_OWNER,
        repo: templateRepoName,
        tree_sha: templateCommitSha,
        recursive: '1'
      });

      // Look for .postpipe-managed.json to dynamically read paths
      const managedJsonItem = treeData.tree.find((item: any) => item.path === '.postpipe-managed.json');
      let currentManagedPaths = MANAGED_PATHS[type] || [];
      if (managedJsonItem) {
        try {
          const { data: managedJsonBlob } = await publicOctokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
            owner: TEMPLATE_OWNER,
            repo: templateRepoName,
            file_sha: managedJsonItem.sha
          });
          const managedJsonContent = Buffer.from(managedJsonBlob.content, 'base64').toString('utf8');
          currentManagedPaths = JSON.parse(managedJsonContent);
          console.log(`Loaded custom managed paths for ${type}:`, currentManagedPaths);
        } catch (err) {
          console.warn('Failed to parse .postpipe-managed.json, falling back to defaults.', err);
        }
      }

      function isPathManaged(path: string): boolean {
        return currentManagedPaths.some(mp => path === mp || path.startsWith(mp));
      }

      templateTreeItems = treeData.tree.filter((item: any) => item.type === 'blob' && isPathManaged(item.path));
    } catch (err) {
      console.error('Error fetching template repository tree:', err);
      throw new Error('Failed to read template repository.');
    }

    // Fetch the file contents once and cache in memory
    const fileContentsCache = new Map<string, string>();
    for (const item of templateTreeItems) {
      try {
        const { data: blobData } = await publicOctokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
          owner: TEMPLATE_OWNER,
          repo: templateRepoName,
          file_sha: item.sha
        });
        // Blob data is base64 encoded
        fileContentsCache.set(item.path, blobData.content);
      } catch (err) {
        console.error(`Failed to fetch blob for ${item.path}`, err);
      }
    }

    let updatedCount = 0;
    let failedCount = 0;

    // 2. Process each user repository
    const promises = connectors.map(async (connector) => {
      try {
        const octokit = await getInstallationOctokit(Number(connector.installationId));
        
        // Ensure app can access this repo
        const repoOwner = connector.repoOwner;
        const repoName = connector.repoName;

        // Get user's default branch and latest commit
        const { data: repoData } = await octokit.request('GET /repos/{owner}/{repo}', {
          owner: repoOwner,
          repo: repoName
        });
        const defaultBranch = repoData.default_branch;

        const { data: refData } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/heads/{branch}', {
          owner: repoOwner,
          repo: repoName,
          branch: defaultBranch
        });
        const userCommitSha = refData.object.sha;

        const { data: userCommitData } = await octokit.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
          owner: repoOwner,
          repo: repoName,
          commit_sha: userCommitSha
        });
        const userBaseTreeSha = userCommitData.tree.sha;

        // Create blobs in the user's repository
        const newTreeItems: any[] = [];
        
        // Add managed files from template
        for (const item of templateTreeItems) {
          const base64Content = fileContentsCache.get(item.path);
          if (base64Content) {
            // create blob in user repo
            const { data: newBlob } = await octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
              owner: repoOwner,
              repo: repoName,
              content: base64Content,
              encoding: 'base64'
            });
            newTreeItems.push({
              path: item.path,
              mode: item.mode,
              type: 'blob',
              sha: newBlob.sha
            });
          }
        }

        // Add the .postpipe-version file update
        const versionContent = JSON.stringify({ template: type, version: newVersion }, null, 2);
        const { data: versionBlob } = await octokit.request('POST /repos/{owner}/{repo}/git/blobs', {
          owner: repoOwner,
          repo: repoName,
          content: versionContent,
          encoding: 'utf-8'
        });
        newTreeItems.push({
          path: '.postpipe-version',
          mode: '100644',
          type: 'blob',
          sha: versionBlob.sha
        });

        // Create the new tree
        const { data: newTree } = await octokit.request('POST /repos/{owner}/{repo}/git/trees', {
          owner: repoOwner,
          repo: repoName,
          base_tree: userBaseTreeSha,
          tree: newTreeItems
        });

        // Create the commit
        const { data: newCommit } = await octokit.request('POST /repos/{owner}/{repo}/git/commits', {
          owner: repoOwner,
          repo: repoName,
          message: `chore(postpipe): update connector template to v${newVersion}`,
          tree: newTree.sha,
          parents: [userCommitSha]
        });

        // Update the branch ref
        await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}', {
          owner: repoOwner,
          repo: repoName,
          branch: defaultBranch,
          sha: newCommit.sha,
          force: false
        });

        // Update DB
        await db.collection('github_connectors').updateOne(
          { _id: connector._id },
          { 
            $set: { 
              templateVersion: newVersion, 
              lastUpdateStatus: 'SUCCESS',
              lastUpdateError: null,
              updatedAt: new Date()
            } 
          }
        );

        updatedCount++;
      } catch (repoErr: any) {
        console.error(`Failed to update user repo ${connector.repoOwner}/${connector.repoName}:`, repoErr);
        // Mark failed in DB
        await db.collection('github_connectors').updateOne(
          { _id: connector._id },
          { 
            $set: { 
              lastUpdateStatus: 'FAILED',
              lastUpdateError: repoErr.message || 'Unknown error',
              lastUpdateAttempt: new Date()
            } 
          }
        );
        failedCount++;
      }
    });

    await Promise.allSettled(promises);

    return {
      success: true,
      updated: updatedCount,
      failed: failedCount
    };
  }
}
