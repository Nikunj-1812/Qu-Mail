export interface ParsedAttachment {
  name: string;
  size: number;
  dataUrl?: string;
}

const ATTACHMENT_DELIMITER = '\n\n---QUMAIL_ATTACHMENTS---\n';

export function encodeBodyWithAttachments(
  body: string,
  attachments: Array<{ name: string; size: number; dataUrl?: string }>
): string {
  if (!attachments || attachments.length === 0) {
    return body;
  }
  const payload = attachments.map((att) => ({
    name: att.name,
    size: att.size,
    dataUrl: att.dataUrl,
  }));
  return `${body}${ATTACHMENT_DELIMITER}${JSON.stringify(payload)}`;
}

export function decodeBodyWithAttachments(rawBody: string): {
  text: string;
  attachments: ParsedAttachment[];
} {
  if (!rawBody) {
    return { text: '', attachments: [] };
  }

  const parts = rawBody.split(ATTACHMENT_DELIMITER);
  if (parts.length < 2) {
    return { text: rawBody, attachments: [] };
  }

  const text = parts[0];
  const jsonStr = parts.slice(1).join(ATTACHMENT_DELIMITER);

  try {
    const attachments = JSON.parse(jsonStr);
    return { text, attachments: Array.isArray(attachments) ? attachments : [] };
  } catch (err) {
    console.error('Failed to parse attachments payload', err);
    return { text: rawBody, attachments: [] };
  }
}
