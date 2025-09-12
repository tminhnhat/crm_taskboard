import { NextRequest, NextResponse } from 'next/server';
import { put, del, list } from '@vercel/blob';

interface CustomColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  paper: string;
  surface: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
}

interface ThemeSettings {
  lightColors: CustomColors;
  darkColors: CustomColors;
}

const THEME_BLOB_KEY = 'theme-settings.json';

export async function GET() {
  try {
    // List all blobs to find the theme settings
    const { blobs } = await list({ prefix: 'theme-settings' });
    
    if (blobs.length === 0) {
      return NextResponse.json({ settings: null });
    }

    // Get the first (and should be only) theme settings file
    const themeBlob = blobs[0];
    const response = await fetch(themeBlob.url);
    const settings: ThemeSettings = await response.json();

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error loading theme settings:', error);
    return NextResponse.json({ settings: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings: ThemeSettings = await request.json();

    // Validate the theme settings structure
    if (!settings.lightColors || !settings.darkColors) {
      return NextResponse.json(
        { error: 'Invalid theme settings structure' },
        { status: 400 }
      );
    }

    // Delete existing theme settings if any
    try {
      const { blobs } = await list({ prefix: 'theme-settings' });
      for (const blob of blobs) {
        await del(blob.url);
      }
    } catch (deleteError) {
      // Continue if delete fails (no existing settings)
      console.log('No existing theme settings to delete');
    }

    // Store new theme settings
    const blob = await put(THEME_BLOB_KEY, JSON.stringify(settings, null, 2), {
      access: 'public',
    });

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      message: 'Theme settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving theme settings:', error);
    return NextResponse.json(
      { error: 'Failed to save theme settings' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Delete all theme settings blobs
    const { blobs } = await list({ prefix: 'theme-settings' });
    
    for (const blob of blobs) {
      await del(blob.url);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Theme settings deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting theme settings:', error);
    return NextResponse.json(
      { error: 'Failed to delete theme settings' },
      { status: 500 }
    );
  }
}