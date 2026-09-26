/**
 * DOMPurify wrapper.
 * All LLM-generated HTML strings must pass through sanitize() before
 * being set via dangerouslySetInnerHTML to prevent XSS.
 */
import DOMPurify from 'dompurify'

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'span'],
    ALLOWED_ATTR: [],
  })
}
