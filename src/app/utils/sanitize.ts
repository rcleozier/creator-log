/**
 * Data sanitization utilities for safe rendering of user-provided content.
 * Prevents XSS attacks and ensures safe display of community-submitted data.
 */

/**
 * Sanitizes text by removing control characters and limiting length
 */
export function sanitizeText(text: string | undefined, maxLength?: number): string {
  if (!text) return '';
  
  // Remove control characters (except newlines, tabs, carriage returns)
  let sanitized = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes URLs to prevent javascript: and other dangerous protocols
 */
export function sanitizeUrl(url: string | undefined): string | null {
  if (!url) return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    
    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.some(proto => urlObj.protocol.toLowerCase().startsWith(proto))) {
      return null;
    }
    
    // Only allow http and https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return null;
    }
    
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return null
    return null;
  }
}

/**
 * Truncates text with ellipsis and provides "Show more" functionality
 */
export function truncateText(text: string, maxLength: number = 1000): { truncated: string; isTruncated: boolean } {
  if (text.length <= maxLength) {
    return { truncated: text, isTruncated: false };
  }
  
  return {
    truncated: text.substring(0, maxLength),
    isTruncated: true
  };
}


