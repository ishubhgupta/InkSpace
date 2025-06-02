/**
 * Content processing utilities for robust blog post handling
 * Handles sanitization, validation, and processing of blog content
 * Special focus on handling copy-pasted content from various sources
 */

import DOMPurify from "isomorphic-dompurify";

const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_TITLE_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 500;

export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  processedContent?: string;
}

export interface ProcessingOptions {
  sanitize?: boolean;
  validateSize?: boolean;
  stripEmptyTags?: boolean;
  compressImages?: boolean;
}

/**
 * Comprehensive copy-paste content sanitizer
 * Handles content from Word, Google Docs, websites, and other rich text sources
 */
export function sanitizeCopyPastedContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  let sanitized = content;

  // 1. Remove Microsoft Word artifacts and smart quotes
  sanitized = sanitized
    // Smart quotes and apostrophes
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes → regular apostrophe
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes → regular quotes
    .replace(/\u2013/g, "-") // En dash → hyphen
    .replace(/\u2014/g, "--") // Em dash → double hyphen
    .replace(/\u2026/g, "...") // Ellipsis → three dots
    .replace(/\u00A0/g, " "); // Non-breaking space → regular space

  // 2. Remove zero-width and invisible characters
  sanitized = sanitized
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width spaces
    .replace(/[\u00AD]/g, "") // Soft hyphens
    .replace(/[\u001F\u007F-\u009F]/g, "") // Control characters
    .replace(/[\uE000-\uF8FF]/g, ""); // Private use area characters

  // 3. Clean up Microsoft Word HTML artifacts
  sanitized = sanitized
    // Remove Word-specific tags and attributes
    .replace(/<\/?o:p[^>]*>/gi, "")
    .replace(/<\/?w:[^>]*>/gi, "")
    .replace(/<\/?m:[^>]*>/gi, "")
    .replace(/class="?Mso[^"]*"?/gi, "")
    .replace(/style="[^"]*mso-[^"]*"/gi, "")
    // Remove empty Word-generated tags
    .replace(/<p class="?MsoNormal"?[^>]*><\/p>/gi, "")
    .replace(/<span style="[^"]*">\s*<\/span>/gi, "");

  // 4. Clean up Google Docs artifacts
  sanitized = sanitized
    .replace(/id="docs-internal-guid-[^"]*"/gi, "")
    .replace(/<b style="font-weight:normal">/gi, "")
    .replace(/<\/b>/gi, "");

  // 5. Normalize whitespace and line breaks
  sanitized = sanitized
    .replace(/\r\n/g, "\n") // Windows line endings → Unix
    .replace(/\r/g, "\n") // Old Mac line endings → Unix
    .replace(/\n{3,}/g, "\n\n") // Multiple line breaks → double
    .replace(/[ \t]+/g, " ") // Multiple spaces/tabs → single space
    .replace(/^\s+|\s+$/gm, ""); // Trim whitespace from each line

  // 6. Fix malformed HTML entities
  sanitized = sanitized
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // 7. Clean up empty paragraphs and divs (common in copy-paste)
  sanitized = sanitized
    .replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/gi, "")
    .replace(/<div[^>]*>(\s|&nbsp;)*<\/div>/gi, "")
    .replace(/<br[^>]*>\s*<br[^>]*>/gi, "<br>");

  // 8. Remove style attributes (often cause issues with copied content)
  sanitized = sanitized
    .replace(/style="[^"]*"/gi, "")
    .replace(/style='[^']*'/gi, "");

  return sanitized.trim();
}

/**
 * Detects if content appears to be copy-pasted from external sources
 */
export function detectCopyPastedContent(content: string): {
  isPasted: boolean;
  confidence: number;
  sources: string[];
} {
  const indicators = {
    microsoftWord: [
      /class="?Mso/i,
      /<o:p>/i,
      /style="[^"]*mso-/i,
      /MsoNormal/i,
    ],
    googleDocs: [
      /docs-internal-guid/i,
      /google-docs/i,
      /<b style="font-weight:normal">/i,
    ],
    webContent: [
      /data-[a-z-]+=/i,
      /aria-[a-z-]+=/i,
      /class="[^"]*wp-/i,
      /role="[^"]*"/i,
    ],
    richText: [
      /[\u2018\u2019\u201C\u201D\u2013\u2014]/,
      /\u00A0/,
      /[\u200B-\u200D]/,
    ],
  };

  const sources: string[] = [];
  let score = 0;

  // Check for Microsoft Word indicators
  if (indicators.microsoftWord.some((pattern) => pattern.test(content))) {
    sources.push("Microsoft Word");
    score += 0.4;
  }

  // Check for Google Docs indicators
  if (indicators.googleDocs.some((pattern) => pattern.test(content))) {
    sources.push("Google Docs");
    score += 0.3;
  }

  // Check for web content indicators
  if (indicators.webContent.some((pattern) => pattern.test(content))) {
    sources.push("Web Content");
    score += 0.2;
  }

  // Check for rich text formatting
  if (indicators.richText.some((pattern) => pattern.test(content))) {
    sources.push("Rich Text Editor");
    score += 0.1;
  }

  return {
    isPasted: score > 0.1,
    confidence: Math.min(score, 1.0),
    sources,
  };
}

/**
 * Validates and processes blog post content
 */
export function validateAndProcessContent(
  content: string,
  options: ProcessingOptions = {}
): ContentValidationResult {
  const {
    sanitize = true,
    validateSize = true,
    stripEmptyTags = true,
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  let processedContent = content;

  try {
    // First, detect and handle copy-pasted content
    const pasteDetection = detectCopyPastedContent(content);
    if (pasteDetection.isPasted) {
      warnings.push(
        `Detected content from: ${pasteDetection.sources.join(
          ", "
        )}. Auto-cleaning applied.`
      );
      processedContent = sanitizeCopyPastedContent(processedContent);
    }

    // Size validation
    if (validateSize && processedContent.length > MAX_CONTENT_SIZE) {
      errors.push(
        `Content size (${Math.round(
          processedContent.length / 1024
        )}KB) exceeds maximum allowed size (${Math.round(
          MAX_CONTENT_SIZE / 1024
        )}KB)`
      );
    }

    // Content sanitization
    if (sanitize) {
      processedContent = DOMPurify.sanitize(processedContent, {
        ALLOWED_TAGS: [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "br",
          "strong",
          "em",
          "u",
          "s",
          "blockquote",
          "ul",
          "ol",
          "li",
          "a",
          "img",
          "figure",
          "figcaption",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "code",
          "pre",
          "hr",
          "div",
          "span",
        ],
        ALLOWED_ATTR: [
          "href",
          "src",
          "alt",
          "title",
          "class",
          "id",
          "width",
          "height",
          "target",
          "rel",
        ],
      });
    }

    // Strip empty tags
    if (stripEmptyTags) {
      processedContent = processedContent
        .replace(/<p><\/p>/g, "")
        .replace(/<div><\/div>/g, "")
        .replace(/<span><\/span>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Check for malformed HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = processedContent;

    if (tempDiv.innerHTML !== processedContent) {
      warnings.push("Content contains malformed HTML that was auto-corrected");
    }

    // Check for large images
    const imgTags = processedContent.match(/<img[^>]+>/g) || [];
    if (imgTags.length > 10) {
      warnings.push(
        `Content contains ${imgTags.length} images, which may slow down loading`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedContent,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Content processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
      warnings,
    };
  }
}

/**
 * Validates blog post metadata
 */
export function validatePostMetadata(data: {
  title: string;
  excerpt?: string;
  slug?: string;
}): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!data.title || !data.title.trim()) {
    errors.push("Title is required");
  } else if (data.title.length > MAX_TITLE_LENGTH) {
    errors.push(
      `Title is too long (${data.title.length}/${MAX_TITLE_LENGTH} characters)`
    );
  }

  // Excerpt validation
  if (data.excerpt && data.excerpt.length > MAX_EXCERPT_LENGTH) {
    warnings.push(
      `Excerpt is quite long (${data.excerpt.length}/${MAX_EXCERPT_LENGTH} characters)`
    );
  }

  // Slug validation
  if (data.slug) {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(data.slug)) {
      warnings.push(
        "Slug should only contain lowercase letters, numbers, and hyphens"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Processes content for search indexing
 */
export function extractTextContent(htmlContent: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  return tempDiv.textContent || tempDiv.innerText || "";
}

/**
 * Estimates content processing time for user feedback
 */
export function estimateProcessingTime(content: string): number {
  const size = content.length;
  const imageCount = (content.match(/<img[^>]+>/g) || []).length;

  // Base time + size factor + image processing time
  return Math.max(1000, size * 0.01 + imageCount * 500);
}
