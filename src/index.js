#!/usr/bin/env node
/**
 * gai-cli-pdf2png - CLI tool for converting PDF pages to PNG images
 *
 * Usage: pdf2png <pdf-path> [--output-dir=<dir>] [--scale=2.0] [--start-page=1] [--end-page=<last>]
 */

import { pdfToPng } from "pdf-to-png-converter";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve, basename } from "path";
import { randomUUID } from "crypto";

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        pdfPath: "",
        outputDir: "",
        viewportScale: 2.0,
        startPage: null,
        endPage: null,
    };

    for (const arg of args) {
        if (arg.startsWith("--output-dir=")) {
            options.outputDir = arg.split("=")[1];
        } else if (arg.startsWith("--scale=")) {
            options.viewportScale = parseFloat(arg.split("=")[1]);
        } else if (arg.startsWith("--start-page=")) {
            options.startPage = parseInt(arg.split("=")[1], 10);
        } else if (arg.startsWith("--end-page=")) {
            options.endPage = parseInt(arg.split("=")[1], 10);
        } else if (arg === "--help" || arg === "-h") {
            printHelp();
            process.exit(0);
        } else if (!arg.startsWith("--")) {
            options.pdfPath = arg;
        }
    }

    if (!options.pdfPath) {
        console.error("Error: PDF path is required");
        printHelp();
        process.exit(1);
    }

    if (!existsSync(options.pdfPath)) {
        console.error(`Error: PDF file not found: ${options.pdfPath}`);
        process.exit(1);
    }

    return options;
}

function printHelp() {
    console.log(`
pdf2png - CLI tool for converting PDF pages to PNG images

Usage: pdf2png <pdf-path> [options]

Arguments:
  pdf-path             Path to the PDF file (required)

Options:
  --output-dir=<dir>   Output directory (default: /tmp/<guid>)
  --scale=N            Scale factor for output quality (default: 2.0)
  --start-page=N       First page to convert (1-indexed, default: 1)
  --end-page=N         Last page to convert (default: last page)
  --help, -h           Show this help message

Examples:
  pdf2png "document.pdf"
  pdf2png "document.pdf" --output-dir=./images
  pdf2png "document.pdf" --scale=1.5
  pdf2png "document.pdf" --start-page=1 --end-page=5
`);
}

async function getPageCount(pdfPath) {
    const loadingTask = getDocument({
        url: pdfPath,
        disableFontFace: true,
        useSystemFonts: false,
    });
    const doc = await loadingTask.promise;
    const pageCount = doc.numPages;
    await doc.destroy();
    return pageCount;
}

async function convertSinglePage(pdfPath, pageNumber, outputDir, viewportScale) {
    const pngPages = await pdfToPng(pdfPath, {
        viewportScale,
        disableFontFace: true,
        useSystemFonts: false,
        pagesToProcess: [pageNumber],
    });

    if (pngPages.length > 0) {
        const outputPath = join(outputDir, `page-${String(pageNumber).padStart(3, "0")}.png`);
        writeFileSync(outputPath, pngPages[0].content);
        return outputPath;
    }
    return null;
}

async function main() {
    const options = parseArgs();

    const resolvedPdfPath = resolve(options.pdfPath);

    if (!options.outputDir) {
        const guid = randomUUID();
        options.outputDir = join("/tmp", guid);
    }

    const resolvedOutputDir = resolve(options.outputDir);

    if (!existsSync(resolvedOutputDir)) {
        mkdirSync(resolvedOutputDir, { recursive: true });
    }

    console.error(`PDF: ${resolvedPdfPath}`);
    console.error(`Output: ${resolvedOutputDir}`);

    const totalPages = await getPageCount(resolvedPdfPath);
    console.error(`Total pages: ${totalPages}`);

    const firstPage = options.startPage || 1;
    const lastPage = options.endPage || totalPages;

    if (firstPage < 1 || lastPage > totalPages || firstPage > lastPage) {
        console.error(`Error: Invalid page range. PDF has ${totalPages} pages. Requested: ${firstPage}-${lastPage}`);
        process.exit(1);
    }

    console.error(`Converting pages ${firstPage} to ${lastPage}...`);

    const savedFiles = [];

    for (let page = firstPage; page <= lastPage; page++) {
        process.stderr.write(`Converting page ${page}/${lastPage}... `);
        try {
            const filePath = await convertSinglePage(
                resolvedPdfPath,
                page,
                resolvedOutputDir,
                options.viewportScale
            );
            if (filePath) {
                savedFiles.push(filePath);
                process.stderr.write(`saved\n`);
            }
        } catch (error) {
            process.stderr.write(`failed: ${error.message}\n`);
        }
    }

    console.error(`\nDone! Converted ${savedFiles.length} pages to PNG`);
    console.error(`Output directory: ${resolvedOutputDir}`);

    console.log(`\nGenerated files:`);
    for (const file of savedFiles) {
        console.log(`  ${basename(file)}`);
    }
}

main().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
});