#!/bin/bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do perl -i -pe "s/\/\/.*$//g; s/\/\*[\s\S]*?\*\///g; s/\{\/\*[\s\S]*?\*\/\}//g;" "$file"; done
