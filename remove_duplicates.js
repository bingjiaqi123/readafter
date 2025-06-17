import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to dict folder
const dictPath = path.join(__dirname, 'src', 'data', 'dict');

// Read all txt files in dict folder
function readTxtFiles() {
    const files = fs.readdirSync(dictPath).filter(file => file.endsWith('.txt'));
    const fileContents = {};
    
    for (const file of files) {
        const filePath = path.join(dictPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        fileContents[file] = lines;
    }
    
    return fileContents;
}

// Remove duplicates from a single file
function removeDuplicatesFromFile(lines) {
    const seen = new Set();
    const uniqueLines = [];
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!seen.has(trimmedLine)) {
            seen.add(trimmedLine);
            uniqueLines.push(trimmedLine);
        }
    }
    
    return uniqueLines;
}

// Remove lines from proper.txt that exist in other files
function removeCommonLinesFromProper(fileContents) {
    if (!fileContents['proper.txt']) return fileContents;
    
    const properLines = fileContents['proper.txt'];
    const otherLines = new Set();
    
    // Collect all lines from other files
    for (const [filename, lines] of Object.entries(fileContents)) {
        if (filename !== 'proper.txt') {
            for (const line of lines) {
                otherLines.add(line.trim());
            }
        }
    }
    
    // Remove lines from proper.txt that exist in other files
    const filteredProperLines = properLines.filter(line => !otherLines.has(line.trim()));
    
    fileContents['proper.txt'] = filteredProperLines;
    return fileContents;
}

// Write files back
function writeFiles(fileContents) {
    for (const [filename, lines] of Object.entries(fileContents)) {
        const filePath = path.join(dictPath, filename);
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    }
}

// Main execution
console.log('开始处理 dict 文件夹下的所有 txt 文件...\n');

const fileContents = readTxtFiles();
const originalCounts = {};

// Show original counts and remove duplicates
for (const [filename, lines] of Object.entries(fileContents)) {
    originalCounts[filename] = lines.length;
    fileContents[filename] = removeDuplicatesFromFile(lines);
    console.log(`${filename}: 原始 ${originalCounts[filename]} 行 -> 去重后 ${fileContents[filename].length} 行 (移除 ${originalCounts[filename] - fileContents[filename].length} 个重复)`);
}

console.log('\n处理 proper.txt 与其他文件的重复行...');

// Remove common lines from proper.txt
const beforeProperCount = fileContents['proper.txt'] ? fileContents['proper.txt'].length : 0;
const updatedFileContents = removeCommonLinesFromProper(fileContents);
const afterProperCount = updatedFileContents['proper.txt'] ? updatedFileContents['proper.txt'].length : 0;

if (fileContents['proper.txt']) {
    console.log(`proper.txt: 移除与其他文件重复的行后 ${beforeProperCount} -> ${afterProperCount} 行 (移除 ${beforeProperCount - afterProperCount} 个重复)`);
}

// Write all files back
writeFiles(updatedFileContents);

console.log('\n所有文件处理完成！'); 