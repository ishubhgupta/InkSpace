export function calculateReadingTime(content: string): number {
  // Average reading speed: 200-250 words per minute
  // We'll use 230 as a middle ground
  const wordsPerMinute = 230;
  
  // If content is HTML, strip HTML tags first
  let text = content;
  if (content.includes('<') && content.includes('>')) {
    // Simple HTML tag removal
    text = content.replace(/<[^>]*>/g, ' ');
  }
  
  // Count words (roughly)
  const wordCount = text.match(/\w+/g)?.length || 0;
  
  // Calculate reading time in minutes
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
}