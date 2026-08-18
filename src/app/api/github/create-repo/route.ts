import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/server-db';
import { getInstallationOctokit } from '@/lib/github/octokit';

export async function POST(req: NextRequest) {
  try {
    const { installationId, type, customName } = await req.json();

    if (!installationId || !type) {
      return NextResponse.json({ error: 'Missing installationId or type' }, { status: 400 });
    }

    const db = await connectDB();

    const installation = await db.collection('github_installations').findOne({ installationId: Number(installationId) });
    if (!installation) {
      return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    }

    // Determine the template repository based on type
    const templateOwner = 'PostPipe'; 
    const templateRepo = type === 'fastapi' ? 'postpipe-connector-fastapi' : 'postpipe-connector-template';
    
    // Generate a unique name for the new repo
    const sanitizedCustomName = customName
      ? String(customName).toLowerCase().trim().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : '';
    const newRepoName = sanitizedCustomName || `postpipe-connector-${type}-${Date.now()}`;

    const octokit = await getInstallationOctokit(Number(installationId));

    // Call GitHub API to generate from template
    let response;
    try {
      response = await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
        template_owner: templateOwner,
        template_repo: templateRepo,
        owner: installation.accountName,
        name: newRepoName,
        description: `Postpipe ${type.toUpperCase()} Connector created automatically via Postpipe App`,
        include_all_branches: false,
        private: false
      });
    } catch (apiError: any) {
      // 403, 422, or 404 can be returned when the GitHub App lacks permissions (e.g. "Selected repositories" only)
      if (apiError.status === 403 || apiError.status === 422 || apiError.status === 404) {
        return NextResponse.json({ 
          error: 'INSUFFICIENT_PERMISSIONS', 
          details: 'The GitHub App may only have access to selected repositories. Postpipe needs permission for All Repositories to generate a new connector automatically.' 
        }, { status: 403 });
      }
      throw apiError;
    }

    const newRepoData = response.data;

    // Wait a brief moment to ensure GitHub has initialized the repository from the template
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inject the .postpipe-version file
    try {
      const versionContent = JSON.stringify({ template: type, version: "1.0.0" }, null, 2);
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: newRepoData.owner.login,
        repo: newRepoData.name,
        path: '.postpipe-version',
        message: 'chore(postpipe): initialize template version tracking',
        content: Buffer.from(versionContent).toString('base64'),
      });
    } catch (versionError) {
      console.warn('Failed to inject .postpipe-version immediately, it may be added later.', versionError);
    }

    // Save connector details to our database using native driver
    await db.collection('github_connectors').insertOne({
      installationId: Number(installationId),
      userId: installation.userId,
      repoOwner: newRepoData.owner.login,
      repoName: newRepoData.name,
      type,
      templateVersion: "1.0.0",
      autoUpdateEnabled: true,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      repoUrl: newRepoData.html_url,
      cloneUrl: newRepoData.clone_url,
      message: 'Repository created successfully',
    });
  } catch (error: any) {
    console.error('Error generating repository:', error);
    return NextResponse.json({ error: 'Failed to create repository', details: error.message }, { status: 500 });
  }
}
