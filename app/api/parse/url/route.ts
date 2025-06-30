import { NextRequest, NextResponse } from 'next/server';
import { ProfileData } from '@/lib/types';
import { parseText } from '@/lib/parse-text';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('linkedin.com')) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL' },
        { status: 400 }
      );
    }

    let browser;
    let extractedText = '';

    try {
      // Launch puppeteer browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the LinkedIn profile
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await new Promise(res => setTimeout(res, 3000));

      // Extract text content from the page
      extractedText = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());

        // Get text content from main content areas
        const selectors = [
          '[data-section="summary"]',
          '[data-section="experience"]',
          '[data-section="education"]',
          '[data-section="skills"]',
          '.pv-text-details__left-panel',
          '.pv-top-card',
          '.pv-about-section',
          '.pv-experience-section',
          '.pv-education-section',
          '.pv-skill-categories-section',
          'main',
          '.scaffold-layout__main'
        ];

        let text = '';
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const elementText = el.textContent || '';
            if (elementText.trim()) {
              text += elementText.trim() + '\n\n';
            }
          });
        }

        // If no specific selectors worked, get all text
        if (!text.trim()) {
          text = document.body.textContent || '';
        }

        return text;
      });

    } catch (scrapeError) {
      console.error('Scraping error:', scrapeError);
      return NextResponse.json(
        { error: 'Failed to scrape LinkedIn profile. The profile might be private or require authentication.' },
        { status: 400 }
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No content could be extracted from the LinkedIn profile' },
        { status: 400 }
      );
    }

    // Parse the scraped text into structured profile data
    const profileData = parseText(extractedText);

    // Validate that we got meaningful data
    if (!profileData.name && !profileData.headline && !profileData.about) {
      return NextResponse.json(
        { error: 'Could not extract meaningful profile data from the URL' },
        { status: 400 }
      );
    }

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('URL scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape LinkedIn profile' },
      { status: 500 }
    );
  }
}