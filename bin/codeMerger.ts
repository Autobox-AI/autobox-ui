const fs = require('fs');
const path = require('path');

const patterns = [
    'components',
    'app/projects',
    'app/page.tsx',
    'app/layout.tsx',
    'styles/globals.css',
    'components.json',
    "tsconfig.json",
    "tailwind.config.ts",
];

const excludePatterns = [
    'node_modules',
    'test',
    '.next'
];

function matchesExcludePattern(filePath: string): boolean {
    return excludePatterns.some(pattern => {
        return filePath.includes(pattern);
    });
}

function matchesPattern(filePath: string): boolean {
    return patterns.some(pattern => {
        // Handle specific file matches (like 'app/page.tsx' or 'app/layout.tsx')
        if (pattern.endsWith('.tsx')) {
            return filePath.endsWith(pattern);
        }
        // Handle directories ('components/*' and 'app/projects/*')
        return filePath.includes(pattern);
    });
}

function getTargetFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach((file: string) => {
        const filePath = path.join(dirPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            // Recursively check within directories
            arrayOfFiles = getTargetFiles(filePath, arrayOfFiles);
        } else {
            // Add the file if it matches one of the inclusion patterns and does not match the exclusion patterns
            if (matchesPattern(filePath) && !matchesExcludePattern(filePath)) {
                arrayOfFiles.push(filePath);
            }
        }
    });

    return arrayOfFiles;
}

function mergeFilesContent(dirPath: string): string {
    const allFiles = getTargetFiles(dirPath);
    let mergedContent = `
I have an issue now:

This is my latest code:
\`\`\`
`;

    allFiles.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        mergedContent += `
=========================================================================================================
FILE NAME: ${file}
=========================================================================================================
${content}

`;
    });

    mergedContent += '```';
    return mergedContent;
}

const projectPath = path.resolve(__dirname, '../');
const mergedContent = mergeFilesContent(projectPath);
console.log(mergedContent);
