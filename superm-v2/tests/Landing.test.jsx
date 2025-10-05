import { test, expect } from '@playwright/test';
import { render } from '@testing-library/react';
import Landing from '../src/Landing';

test.describe('Landing Component', () => {
    test('renders the title correctly', async ({ page }) => {
        await page.setContent('<div id="root"></div>');
        render(<Landing />, { container: document.getElementById('root') });
        const title = await page.locator('title');
        await expect(title).toHaveText('SuperM');
    });

    test('renders the heading and tagline', async ({ page }) => {
        await page.setContent('<div id="root"></div>');
        render(<Landing />, { container: document.getElementById('root') });
        const heading = await page.locator('h1');
        const tagline = await page.locator('.tagline.text-dimmed');
        await expect(heading).toHaveText('Online shopping simplified');
        await expect(tagline).toHaveText(
            'Order your groceries from SuperM with our easy to use app, and get your products delivered straight to your doorstep.'
        );
    });

    test('renders the Start shopping button with correct link', async ({ page }) => {
        await page.setContent('<div id="root"></div>');
        render(<Landing />, { container: document.getElementById('root') });
        const button = await page.locator('.btn');
        await expect(button).toHaveText('Start shopping');
        await expect(button).toHaveAttribute('href', '/products');
    });

    test('renders the landing cover image with correct attributes', async ({ page }) => {
        await page.setContent('<div id="root"></div>');
        render(<Landing />, { container: document.getElementById('root') });
        const image = await page.locator('.landing-cover');
        await expect(image).toHaveAttribute('src', 'landing.jpg');
        await expect(image).toHaveAttribute('alt', 'Display of fruits and vegetables');
        await expect(image).toHaveAttribute('width', '816');
        await expect(image).toHaveAttribute('height', '380');
    });
});

// We recommend installing an extension to run playwright tests.