import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/server-db';
import { getInstallationOctokit } from '@/lib/github/octokit';

export async function POST(req: NextRequest) {
  try {
    const { newVersion, type, secret } = await req.json();

    // Protect this endpoint so only you can call it from your publish script
    if (secret !== process.env.GITHUB_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!newVersion || !type) {
      return NextResponse.json({ error: 'Missing newVersion or type' }, { status: 400 });
    }

    const db = await connectDB();

    // Find all connectors of this type (e.g. 'js' or 'fastapi')
    const connectors = await db.collection('github_connectors').find({ type }).toArray();
    const results = [];

    for (const connector of connectors) {
      try {
        const octokit = await getInstallationOctokit(Number(connector.installationId));
        
        const filePath = type === 'js' ? 'package.json' : 'requirements.txt';

        // 1. Get the current file to get its SHA
        const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: connector.repoOwner,
          repo: connector.repoName,
          path: filePath,
        });

        if (Array.isArray(fileData)) throw new Error('Path is a directory');

        // 2. Decode content and update it
        let contentStr = Buffer.from((fileData as any).content, 'base64').toString('utf8');

        
        if (type === 'js') {
          const packageJson = JSON.parse(contentStr);
          packageJson.dependencies['@postpipe-official/connector-core'] = `^${newVersion}`;
          
          // Force typescript to strictly 5.9.3 to prevent Vercel from using TS 7+ which breaks the build
          if (packageJson.devDependencies && packageJson.devDependencies.typescript) {
            packageJson.devDependencies.typescript = "5.9.3";
          }
          if (packageJson.dependencies && packageJson.dependencies.typescript) {
            packageJson.dependencies.typescript = "5.9.3";
          }

          contentStr = JSON.stringify(packageJson, null, 2) + '\n';
        } else if (type === 'fastapi') {
          // Find and replace the version for python package
          contentStr = contentStr.replace(/postpipe-connector-core==[0-9\.]+/, `postpipe-connector-core==${newVersion}`);
        }

        const newContentBase64 = Buffer.from(contentStr).toString('base64');

        // 3. Commit the updated file
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: connector.repoOwner,
          repo: connector.repoName,
          path: filePath,
          message: `build(deps): auto-update core dependency to ${newVersion}`,
          content: newContentBase64,
          sha: fileData.sha,
        });

        results.push({ repo: `${connector.repoOwner}/${connector.repoName}`, status: 'success' });
      } catch (err: any) {
        console.error(`Failed to update ${connector.repoOwner}/${connector.repoName}:`, err);
        results.push({ repo: `${connector.repoOwner}/${connector.repoName}`, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Mass update triggered for ${connectors.length} repositories`,
      results,
    });
  } catch (error: any) {
    console.error('Error in mass update:', error);
    return NextResponse.json({ error: 'Failed to perform mass update', details: error.message }, { status: 500 });
  }
}
