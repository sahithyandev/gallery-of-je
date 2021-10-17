const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE;

console.log(`Commit Message: ${commitMessage}`);

process.exit(commitMessage.includes("[skip-deploy]") ? 0 : 1);
