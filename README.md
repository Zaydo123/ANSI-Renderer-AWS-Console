# ANSI Renderer for AWS Console

A Chrome extension that renders ANSI escape sequences in AWS CloudWatch Logs and ECS task logs with proper colors and formatting.

## Features

- 🎨 **Full ANSI Color Support** - Renders all standard ANSI color codes (foreground/background)
- ✨ **Text Styling** - Supports bold, dim, italic, and underline formatting
- 🔄 **Real-time Processing** - Automatically detects and renders new log entries as they appear
- 🎯 **AWS Integration** - Works seamlessly with CloudWatch Logs and ECS task logs
- ⚡ **Performance** - Efficient processing with debouncing and intelligent DOM observation

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Zaydo123/ANSI-Renderer-AWS-Console.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked" and select the cloned directory

5. Navigate to your AWS CloudWatch or ECS logs - ANSI codes will now render automatically!

## Supported ANSI Codes

### Colors
- **Foreground**: Black, Red, Green, Yellow, Blue, Magenta, Cyan, White (30-37, 90-97)
- **Background**: Black, Red, Green, Yellow, Blue, Magenta, Cyan, White (40-47, 100-107)

### Text Styles
- Bold (1)
- Dim (2)
- Italic (3)
- Underline (4)

### Format Support
- `\x1b[XXm` - Standard ANSI escape sequences
- `[XXm` - Bare ANSI codes (common in AWS logs)

## How It Works

The extension:
1. Monitors AWS Console pages for log content
2. Detects ANSI escape sequences in log text
3. Parses the sequences and converts them to styled HTML
4. Replaces the original text with the formatted version
5. Watches for new logs and processes them automatically

## Development

### File Structure
```
.
├── manifest.json      # Extension configuration
├── content.js         # Main content script
├── ansi-parser.js     # ANSI code parser
├── styles.css         # ANSI color styles
└── icons/            # Extension icons
```

### Testing

1. Make your changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload your AWS Console page

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Credits

Built with ☕ for better AWS log readability
