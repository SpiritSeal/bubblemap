import { node } from '../../types';
import { ROOT_NODE_ID } from '../../nodeOps';

const SVG_NS = 'http://www.w3.org/2000/svg';
// Whitespace around the map content in exported images.
const EXPORT_PADDING = 24;
// Rasterization cap so a sprawling map can't allocate a gigantic canvas.
const MAX_PNG_DIMENSION = 4096;
const PNG_SCALE = 2;

// Matches the MUI theme font the canvas renders with; exported SVG has no
// stylesheet to inherit it from.
const EXPORT_FONT_FAMILY = 'Roboto, Helvetica, Arial, sans-serif';

export const sanitizeFilename = (title: string): string => {
  // eslint-disable-next-line no-control-regex
  const cleaned = title.replace(/[/\\:*?"<>|\u0000-\u001f]/g, '').trim();
  return cleaned || 'mindmap';
};

// Walks the tree from the root, one `- ` list item per node, indented by
// depth. A visited set guards against cycles, and anything unreachable from
// the root (malformed legacy data) is appended at top level so no text is
// silently dropped.
export const mindMapToMarkdown = (nodes: node[], title: string): string => {
  const lines: string[] = [`# ${title}`, ''];
  const visited = new Set<string>();
  const walk = (current: node, depth: number) => {
    if (visited.has(current.id)) return;
    visited.add(current.id);
    lines.push(`${'  '.repeat(depth)}- ${current.text.replace(/\s+/g, ' ')}`);
    nodes
      .filter((o) => o.parent === current.id && o.id !== current.id)
      .forEach((child) => walk(child, depth + 1));
  };
  const root = nodes.find((o) => o.id === ROOT_NODE_ID);
  if (root) walk(root, 0);
  nodes.forEach((orphan) => {
    if (!visited.has(orphan.id)) walk(orphan, 0);
  });
  return `${lines.join('\n')}\n`;
};

// Clones the live canvas <svg>, crops it to the full extent of the map (the
// live element only sizes the viewport), and inlines everything a standalone
// file needs: explicit dimensions, a background, and a font. Classes and
// inline styles are stripped — they reference app CSS that doesn't ship with
// the file (cursor styles, the selection-glow animation).
export const buildSvgExport = (
  svgElement: SVGSVGElement,
  backgroundColor: string,
): { svgString: string; width: number; height: number } => {
  const bounds = svgElement.getBBox();
  const x = bounds.x - EXPORT_PADDING;
  const y = bounds.y - EXPORT_PADDING;
  const width = bounds.width + 2 * EXPORT_PADDING;
  const height = bounds.height + 2 * EXPORT_PADDING;

  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute('class');
  clone.removeAttribute('style');
  clone
    .querySelectorAll('[class]')
    .forEach((el) => el.removeAttribute('class'));
  clone
    .querySelectorAll('[style]')
    .forEach((el) => el.removeAttribute('style'));

  clone.setAttribute('xmlns', SVG_NS);
  clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.setAttribute('font-family', EXPORT_FONT_FAMILY);

  const background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('x', String(x));
  background.setAttribute('y', String(y));
  background.setAttribute('width', String(width));
  background.setAttribute('height', String(height));
  background.setAttribute('fill', backgroundColor);
  clone.insertBefore(background, clone.firstChild);

  return {
    svgString: new XMLSerializer().serializeToString(clone),
    width,
    height,
  };
};

export const svgToPngBlob = (
  svgString: string,
  width: number,
  height: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const scale = Math.min(
      PNG_SCALE,
      MAX_PNG_DIMENSION / Math.max(width, height, 1),
    );
    const svgUrl = URL.createObjectURL(
      new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }),
    );
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(svgUrl);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not create a canvas to rasterize the PNG'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('PNG rasterization failed'));
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Failed to load the exported SVG for rasterization'));
    };
    image.src = svgUrl;
  });

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
