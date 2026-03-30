---
name: pdf2png
description: "CLI tool for converting PDF pages to PNG images. Use when: user wants to convert PDF to images."
homepage: https://github.com/kakkoii1337/gai-cli-pdf2png
metadata:
  {
    "openclaw":
      {
        "emoji": "📄",
        "requires": { "node": ">=18.0.0" },
        "install":
          [
            {
              "id": "npm",
              "kind": "npm",
              "package": "gai-cli-pdf2png",
              "label": "Install via npm",
            },
          ],
      },
  }
---

# pdf2png

CLI tool for converting PDF pages to PNG images.

## Installation

```bash
npm install -g gai-cli-pdf2png
```

Or run directly:

```bash
npx gai-cli-pdf2png "document.pdf"
```

## Usage

```bash
pdf2png <pdf-path> [options]
```

### Arguments

- `pdf-path` - Path to the PDF file (required)

### Options

- `--output-dir=<dir>` - Output directory (default: /tmp/<guid>)
- `--scale=N` - Scale factor for output quality (default: 2.0)
- `--start-page=N` - First page to convert (1-indexed, default: 1)
- `--end-page=N` - Last page to convert (default: last page)
- `--help, -h` - Show help message

### Examples

```bash
# Basic conversion
pdf2png "document.pdf"

# Save to specific directory
pdf2png "document.pdf" --output-dir=./images

# Lower quality (smaller files)
pdf2png "document.pdf" --scale=1.5

# Convert specific pages
pdf2png "document.pdf" --start-page=1 --end-page=5
```

## Output

Creates PNG files named `page-001.png`, `page-002.png`, etc. in the output directory.

## Notes

- Processes one page at a time to handle large files
- Default scale of 2.0 gives high-quality output
- Uses pdf-to-png-converter and pdfjs-dist