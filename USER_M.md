## Overview

Script Runner is a web-based application for managing and executing shell scripts. It provides a modern interface for creating, editing, organizing, and running shell scripts with real-time output monitoring and execution history tracking.

## Key Workflows

### Creating and Running a Script

1. Navigate to Scripts view
2. Right-click in file tree → Create new script
3. Enter script name (".sh" extension added automatically)
4. Click "Edit" to add script content (or double click the code area)
5. Click "Save" to save changes (or press Ctrl+S)
6. Click "Run" to execute the script
7. Monitor output in real-time

### Managing Script Organization

1. Create folders by right-clicking in file tree
2. Drag and drop scripts between folders
3. Rename files/folders by right-clicking and selecting rename
4. Delete unwanted files with confirmation

### Monitoring Executions

1. Switch to Active view to see running scripts
2. Click on script names to jump to the script editor
3. View real-time output and execution status
4. Check History view for completed executions

## Technical Notes

- Scripts are stored and managed on the server
- Real-time communication via Server-Sent Events (SSE)
- Supports standard shell script execution
- Automatic file synchronization between client and server
- Built with React, TypeScript, and modern web technologies
