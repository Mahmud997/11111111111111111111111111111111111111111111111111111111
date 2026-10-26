/**
 * Replace {{placeholders}} in template strings with client data.
 * Supports nested access and special helpers.
 */

export function replacePlaceholders(
  text: string | undefined | null,
  data: Record<string, any>
): string {
  if (!text) return '';

  return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key: string) => {
    const value = key.split('.').reduce((obj, k) => (obj ? obj[k] : undefined), data);

    if (value === undefined || value === null) return '';

    // Special helpers
    if (key === 'groom_initial' && data.groom) {
      return String(data.groom).charAt(0).toUpperCase();
    }
    if (key === 'bride_initial' && data.bride) {
      return String(data.bride).charAt(0).toUpperCase();
    }
    if (key === 'date' && data.date) {
      try {
        return new Date(data.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return String(data.date);
      }
    }

    return String(value);
  });
}

/**
 * Deep-clone template objects and replace all content placeholders.
 */
export function mergeTemplateWithClientData(
  template: any,
  clientData: Record<string, any>
): any {
  const cloned = JSON.parse(JSON.stringify(template));

  // Replace in intro sealText
  if (cloned.introConfig?.sealText) {
    cloned.introConfig.sealText = replacePlaceholders(cloned.introConfig.sealText, clientData);
  }

  // Replace in every object content
  if (Array.isArray(cloned.objects)) {
    cloned.objects = cloned.objects.map((obj: any) => {
      if (obj.content) {
        obj.content = replacePlaceholders(obj.content, clientData);
      }
      // Also replace in style if needed (rare)
      return obj;
    });
  }

  return cloned;
}
