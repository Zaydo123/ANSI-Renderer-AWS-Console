/**
 * ANSI Escape Sequence Parser
 * Converts ANSI escape sequences to HTML with CSS styling
 */

const AnsiParser = {
  // 256-color palette (standard XTerm colors)
  colors256: [
    // 0-15: Standard colors (same as 8/16 color mode)
    '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff',
    // 16-231: 216 colors (6x6x6 RGB cube)
    '#000000', '#00005f', '#000087', '#0000af', '#0000d7', '#0000ff',
    '#005f00', '#005f5f', '#005f87', '#005faf', '#005fd7', '#005fff',
    '#008700', '#00875f', '#008787', '#0087af', '#0087d7', '#0087ff',
    '#00af00', '#00af5f', '#00af87', '#00afaf', '#00afd7', '#00afff',
    '#00d700', '#00d75f', '#00d787', '#00d7af', '#00d7d7', '#00d7ff',
    '#00ff00', '#00ff5f', '#00ff87', '#00ffaf', '#00ffd7', '#00ffff',
    '#5f0000', '#5f005f', '#5f0087', '#5f00af', '#5f00d7', '#5f00ff',
    '#5f5f00', '#5f5f5f', '#5f5f87', '#5f5faf', '#5f5fd7', '#5f5fff',
    '#5f8700', '#5f875f', '#5f8787', '#5f87af', '#5f87d7', '#5f87ff',
    '#5faf00', '#5faf5f', '#5faf87', '#5fafaf', '#5fafd7', '#5fafff',
    '#5fd700', '#5fd75f', '#5fd787', '#5fd7af', '#5fd7d7', '#5fd7ff',
    '#5fff00', '#5fff5f', '#5fff87', '#5fffaf', '#5fffd7', '#5fffff',
    '#870000', '#87005f', '#870087', '#8700af', '#8700d7', '#8700ff',
    '#875f00', '#875f5f', '#875f87', '#875faf', '#875fd7', '#875fff',
    '#878700', '#87875f', '#878787', '#8787af', '#8787d7', '#8787ff',
    '#87af00', '#87af5f', '#87af87', '#87afaf', '#87afd7', '#87afff',
    '#87d700', '#87d75f', '#87d787', '#87d7af', '#87d7d7', '#87d7ff',
    '#87ff00', '#87ff5f', '#87ff87', '#87ffaf', '#87ffd7', '#87ffff',
    '#af0000', '#af005f', '#af0087', '#af00af', '#af00d7', '#af00ff',
    '#af5f00', '#af5f5f', '#af5f87', '#af5faf', '#af5fd7', '#af5fff',
    '#af8700', '#af875f', '#af8787', '#af87af', '#af87d7', '#af87ff',
    '#afaf00', '#afaf5f', '#afaf87', '#afafaf', '#afafd7', '#afafff',
    '#afd700', '#afd75f', '#afd787', '#afd7af', '#afd7d7', '#afd7ff',
    '#afff00', '#afff5f', '#afff87', '#afffaf', '#afffd7', '#afffff',
    '#d70000', '#d7005f', '#d70087', '#d700af', '#d700d7', '#d700ff',
    '#d75f00', '#d75f5f', '#d75f87', '#d75faf', '#d75fd7', '#d75fff',
    '#d78700', '#d7875f', '#d78787', '#d787af', '#d787d7', '#d787ff',
    '#d7af00', '#d7af5f', '#d7af87', '#d7afaf', '#d7afd7', '#d7afff',
    '#d7d700', '#d7d75f', '#d7d787', '#d7d7af', '#d7d7d7', '#d7d7ff',
    '#d7ff00', '#d7ff5f', '#d7ff87', '#d7ffaf', '#d7ffd7', '#d7ffff',
    '#ff0000', '#ff005f', '#ff0087', '#ff00af', '#ff00d7', '#ff00ff',
    '#ff5f00', '#ff5f5f', '#ff5f87', '#ff5faf', '#ff5fd7', '#ff5fff',
    '#ff8700', '#ff875f', '#ff8787', '#ff87af', '#ff87d7', '#ff87ff',
    '#ffaf00', '#ffaf5f', '#ffaf87', '#ffafaf', '#ffafd7', '#ffafff',
    '#ffd700', '#ffd75f', '#ffd787', '#ffd7af', '#ffd7d7', '#ffd7ff',
    '#ffff00', '#ffff5f', '#ffff87', '#ffffaf', '#ffffd7', '#ffffff',
    // 232-255: Grayscale
    '#080808', '#121212', '#1c1c1c', '#262626', '#303030', '#3a3a3a',
    '#444444', '#4e4e4e', '#585858', '#626262', '#6c6c6c', '#767676',
    '#808080', '#8a8a8a', '#949494', '#9e9e9e', '#a8a8a8', '#b2b2b2',
    '#bcbcbc', '#c6c6c6', '#d0d0d0', '#dadada', '#e4e4e4', '#eeeeee'
  ],

  /**
   * Parse ANSI escape sequences and convert to HTML
   * @param {string} text - Text containing ANSI escape sequences
   * @returns {string} HTML with styled spans
   */
  parse(text) {
    if (!text || typeof text !== 'string') return '';

    // Check if text contains ANSI sequences (proper or escaped)
    const hasProperAnsi = text.includes('\x1b[') || text.includes('\u001b[');
    const hasEscapedAnsi = /\[(\d+)(;\d+)*m/.test(text);

    if (!hasProperAnsi && !hasEscapedAnsi) {
      return this.escapeHtml(text);
    }

    const result = [];
    const state = {
      fg: null,        // Foreground color
      bg: null,        // Background color
      bold: false,
      dim: false,
      italic: false,
      underline: false,
      blink: false,
      reverse: false,
      strikethrough: false
    };

    // Regex to match both proper ANSI and escaped ANSI sequences
    // Matches: \x1b[32m OR [32m
    const ansiRegex = /(?:\x1b\[|\u001b\[|\[)([0-9;]*)m/g;
    let lastIndex = 0;
    let match;

    while ((match = ansiRegex.exec(text)) !== null) {
      // Add text before the escape sequence
      if (match.index > lastIndex) {
        const textSegment = text.substring(lastIndex, match.index);
        result.push(this.wrapWithStyle(textSegment, state));
      }

      // Process the escape sequence
      const codes = match[1] ? match[1].split(';').map(Number) : [0];
      this.processCodes(codes, state);

      lastIndex = ansiRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textSegment = text.substring(lastIndex);
      result.push(this.wrapWithStyle(textSegment, state));
    }

    return result.join('');
  },

  /**
   * Process ANSI codes and update state
   */
  processCodes(codes, state) {
    let i = 0;
    while (i < codes.length) {
      const code = codes[i];

      if (code === 0) {
        // Reset all
        state.fg = null;
        state.bg = null;
        state.bold = false;
        state.dim = false;
        state.italic = false;
        state.underline = false;
        state.blink = false;
        state.reverse = false;
        state.strikethrough = false;
      } else if (code === 1) {
        state.bold = true;
      } else if (code === 2) {
        state.dim = true;
      } else if (code === 3) {
        state.italic = true;
      } else if (code === 4) {
        state.underline = true;
      } else if (code === 5) {
        state.blink = true;
      } else if (code === 7) {
        state.reverse = true;
      } else if (code === 9) {
        state.strikethrough = true;
      } else if (code === 22) {
        state.bold = false;
        state.dim = false;
      } else if (code === 23) {
        state.italic = false;
      } else if (code === 24) {
        state.underline = false;
      } else if (code === 25) {
        state.blink = false;
      } else if (code === 27) {
        state.reverse = false;
      } else if (code === 29) {
        state.strikethrough = false;
      } else if (code >= 30 && code <= 37) {
        // Standard foreground colors
        state.fg = `ansi-fg-${code - 30}`;
      } else if (code === 38) {
        // Extended foreground color
        const result = this.parseExtendedColor(codes, i);
        if (result) {
          state.fg = result.color;
          i = result.newIndex;
        }
      } else if (code === 39) {
        // Default foreground
        state.fg = null;
      } else if (code >= 40 && code <= 47) {
        // Standard background colors
        state.bg = `ansi-bg-${code - 40}`;
      } else if (code === 48) {
        // Extended background color
        const result = this.parseExtendedColor(codes, i);
        if (result) {
          state.bg = result.color;
          i = result.newIndex;
        }
      } else if (code === 49) {
        // Default background
        state.bg = null;
      } else if (code >= 90 && code <= 97) {
        // Bright foreground colors
        state.fg = `ansi-fg-${code - 90 + 8}`;
      } else if (code >= 100 && code <= 107) {
        // Bright background colors
        state.bg = `ansi-bg-${code - 100 + 8}`;
      }

      i++;
    }
  },

  /**
   * Parse extended color codes (256-color and RGB)
   */
  parseExtendedColor(codes, startIndex) {
    if (startIndex + 1 >= codes.length) return null;

    const colorType = codes[startIndex + 1];

    if (colorType === 5) {
      // 256-color palette
      if (startIndex + 2 >= codes.length) return null;
      const colorIndex = codes[startIndex + 2];
      if (colorIndex >= 0 && colorIndex < 256) {
        return {
          color: this.colors256[colorIndex],
          newIndex: startIndex + 2
        };
      }
    } else if (colorType === 2) {
      // RGB color
      if (startIndex + 4 >= codes.length) return null;
      const r = codes[startIndex + 2];
      const g = codes[startIndex + 3];
      const b = codes[startIndex + 4];
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        return {
          color: `rgb(${r}, ${g}, ${b})`,
          newIndex: startIndex + 4
        };
      }
    }

    return null;
  },

  /**
   * Wrap text with appropriate styling
   */
  wrapWithStyle(text, state) {
    if (!text) return '';

    const escapedText = this.escapeHtml(text);

    // Check if any styles are active
    const hasStyles = state.fg || state.bg || state.bold || state.dim ||
                     state.italic || state.underline || state.blink ||
                     state.reverse || state.strikethrough;

    if (!hasStyles) {
      return escapedText;
    }

    const classes = [];
    const styles = [];

    // Add color classes or inline styles
    if (state.fg) {
      if (state.fg.startsWith('ansi-fg-')) {
        classes.push(state.fg);
      } else {
        styles.push(`color: ${state.fg}`);
      }
    }

    if (state.bg) {
      if (state.bg.startsWith('ansi-bg-')) {
        classes.push(state.bg);
      } else {
        styles.push(`background-color: ${state.bg}`);
      }
    }

    // Add formatting classes
    if (state.bold) classes.push('ansi-bold');
    if (state.dim) classes.push('ansi-dim');
    if (state.italic) classes.push('ansi-italic');
    if (state.underline) classes.push('ansi-underline');
    if (state.blink) classes.push('ansi-blink');
    if (state.reverse) classes.push('ansi-reverse');
    if (state.strikethrough) classes.push('ansi-strikethrough');

    const classAttr = classes.length ? ` class="${classes.join(' ')}"` : '';
    const styleAttr = styles.length ? ` style="${styles.join('; ')}"` : '';

    return `<span${classAttr}${styleAttr}>${escapedText}</span>`;
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Make available globally
window.AnsiParser = AnsiParser;
