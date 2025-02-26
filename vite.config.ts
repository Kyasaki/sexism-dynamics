import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1] // Extrait uniquement REPO_NAME
  : '';

export default defineConfig({
  plugins: [preact()],
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : '/',
})
