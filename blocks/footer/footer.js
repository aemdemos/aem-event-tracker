import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Load footer content from fragment (Word Document at /footer path)
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // Clear block
  block.textContent = '';

  // Create footer container
  const footerContainer = document.createElement('div');

  // Add Adobe logo (left side)
  const logoContainer = document.createElement('div');
  logoContainer.className = 'footer-logo';
  logoContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 179.35 46.86">
      <path fill="#505050" d="M76.93,30.93l-1.92,5.93c-0.08,0.2-0.2,0.32-0.44,0.32h-4.64c-0.28,0-0.36-0.16-0.32-0.4l8.01-23.1
        c0.16-0.44,0.32-0.92,0.4-2.44c0-0.16,0.12-0.28,0.24-0.28h6.41c0.2,0,0.28,0.04,0.32,0.24l9.09,25.62
        c0.08,0.2,0.04,0.36-0.2,0.36h-5.21c-0.24,0-0.36-0.08-0.44-0.28l-2.04-5.97H76.93z M84.7,25.92c-0.8-2.64-2.4-7.49-3.16-10.33
        H81.5c-0.64,2.68-2.08,7.09-3.12,10.33H84.7z
        M94.7,27.4c0-5.73,4.28-10.53,11.61-10.53c0.32,0,0.72,0.04,1.32,0.08V9.07c0-0.2,0.12-0.28,0.28-0.28h5.04
        c0.2,0,0.24,0.08,0.24,0.24v23.66c0,0.92,0.04,2.12,0.16,2.92c0,0.2-0.04,0.28-0.28,0.36c-2.76,1.16-5.41,1.6-7.89,1.6
        C99.27,37.57,94.7,34.21,94.7,27.4z M107.63,21.72c-0.4-0.16-0.92-0.2-1.48-0.2c-3.08,0-5.73,1.88-5.73,5.61
        c0,3.96,2.28,5.69,5.33,5.69c0.68,0,1.32-0.04,1.88-0.24V21.72z
        M136.13,27.12c0,6.29-4.08,10.45-9.85,10.45c-6.85,0-9.89-5.17-9.89-10.33c0-5.69,3.8-10.37,9.97-10.37
        C132.81,16.87,136.13,21.72,136.13,27.12z M122.04,27.16c0,3.52,1.64,5.77,4.32,5.77c2.32,0,4.08-2,4.08-5.69
        c0-3.12-1.28-5.73-4.32-5.73C123.8,21.52,122.04,23.6,122.04,27.16z
        M144.55,8.79c0.32,0,0.4,0.04,0.4,0.32v8.21c1.04-0.28,2.16-0.44,3.36-0.44c5.89,0,9.61,4.16,9.61,9.53
        c0,7.49-5.93,11.17-12.01,11.17c-2.12,0-4.24-0.28-6.29-0.92c-0.12-0.04-0.24-0.24-0.24-0.4V9.07c0-0.2,0.08-0.28,0.28-0.28
        H144.55z M147.31,21.6c-1.28,0-1.84,0.2-2.36,0.32v10.85c0.48,0.12,1,0.16,1.48,0.16c3.04,0,5.81-1.84,5.81-6.01
        C152.23,23.28,150.11,21.6,147.31,21.6z
        M165.75,28.68c0.2,2.28,1.8,4.16,5.73,4.16c1.8,0,3.4-0.28,4.92-0.92c0.12-0.08,0.24-0.04,0.24,0.2v3.8
        c0,0.28-0.08,0.4-0.28,0.48c-1.6,0.76-3.36,1.16-6.13,1.16c-7.53,0-10.17-5.17-10.17-10.13c0-5.53,3.4-10.57,9.69-10.57
        c6.05,0,8.45,4.68,8.45,8.65c0,1.24-0.08,2.24-0.2,2.68c-0.04,0.2-0.12,0.28-0.32,0.32c-0.52,0.08-2.04,0.16-4.12,0.16H165.75z
        M170.95,24.8c1.28,0,1.84-0.04,2-0.08c0-0.08,0-0.24,0-0.28c0-0.96-0.76-3.16-3.4-3.16c-2.52,0-3.6,1.88-3.84,3.52H170.95z
        M33.04,0 52.41,0 52.41,46.39
        M19.39,0 0,0 0,46.39
        M26.21,17.09 38.56,46.38 30.47,46.38 26.78,37.06 17.74,37.06"></path>
    </svg>
  `;

  // Add Word Document content (right side)
  // Simply clone the fragment content - it already has the correct styling from Word
  const contentContainer = document.createElement('div');
  contentContainer.className = 'footer-content';

  // Clone all content from fragment
  while (fragment.firstChild) {
    contentContainer.appendChild(fragment.firstChild);
  }

  // Assemble footer
  footerContainer.appendChild(logoContainer);
  footerContainer.appendChild(contentContainer);
  block.appendChild(footerContainer);
}
