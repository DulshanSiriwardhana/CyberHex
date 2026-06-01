import os
import re

def fix_imports(content):
    # Fix import type ReactNode, ErrorInfo
    content = re.sub(r"import\s*{\s*ReactNode\s*}\s*from\s*['\"]react['\"]", "import type { ReactNode } from 'react'", content)
    content = re.sub(r"import\s*{\s*ErrorInfo\s*,\s*ReactNode\s*}\s*from\s*['\"]react['\"]", "import type { ErrorInfo, ReactNode } from 'react'", content)
    content = re.sub(r"import\s*{\s*ReactNode\s*,\s*ErrorInfo\s*}\s*from\s*['\"]react['\"]", "import type { ReactNode, ErrorInfo } from 'react'", content)
    content = re.sub(r"import\s*React\s*,\s*{\s*ReactNode\s*}\s*from\s*['\"]react['\"]", "import React, { type ReactNode } from 'react'", content)
    return content

for root, _, files in os.walk('client/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            new_content = fix_imports(content)
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
