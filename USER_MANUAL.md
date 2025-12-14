# Script Runner - User Manual

## Overview

Script Runner is a web-based application for managing and executing shell scripts. It provides a modern interface for creating, editing, organizing, and running shell scripts with real-time output monitoring and execution history tracking.

## Main Features

### 1. Script Management

- **File Tree Navigation**: Browse and organize shell scripts in a hierarchical folder structure
- **Create Scripts**: Add new shell scripts (`.sh` files) and folders
- **Edit Scripts**: Inline editing with syntax highlighting
- **Rename & Move**: Rename files/folders and move them between directories
- **Delete**: Remove scripts and folders (with confirmation dialogs)
- **Auto-save**: Changes are automatically saved to the server

### 2. Script Execution

- **Run Scripts**: Execute shell scripts with a single click
- **Real-time Output**: View script output and errors as they occur
- **Execution Status**: See running, completed, or failed execution states
- **Interrupt Execution**: Stop running scripts if needed
- **Execution Results**: Clear success/failure indicators

### 3. Navigation & Views

The app has three main views accessible via the sidebar:

#### Scripts View

- **Primary workspace** for managing and editing scripts
- **File tree** on the left for navigation
- **Script editor/viewer** on the right when a script is selected
- **Action buttons** for editing and running scripts

#### Active View

- **Real-time monitoring** of currently running scripts
- **Live status updates** with execution progress
- **Badge counter** showing number of active executions
- **Quick access** to running script details

#### History View

- **Execution history** of all completed script runs
- **Execution details** including start time, duration, and results
- **Output viewing** for past executions
- **Unseen count badge** for new execution results
- **Success/failure status** indicators

### 4. User Interface Features

- **Modern Design**: Clean, responsive interface with dark theme
- **Context Menus**: Right-click actions for file operations
- **Search Functionality**: Global search across the application
- **Tooltips**: Helpful information on hover
- **Confirmation Dialogs**: Safety prompts for destructive actions
- **Keyboard Shortcuts**: Quick access to common functions

### 5. Execution Monitoring

- **Live Output**: Real-time display of script output and errors
- **Execution Timing**: Start time and duration tracking
- **Status Indicators**: Visual feedback for running, success, failure, and interrupted states
- **Output History**: View complete output from previous executions
- **Error Handling**: Clear distinction between regular output and error messages

## Getting Started

1. **Launch the Application**: Start the development server using `bun dev`
2. **Navigate Scripts**: Use the file tree in the Scripts view to browse existing scripts
3. **Create a Script**: Right-click in the file tree to create new scripts or folders
4. **Edit Scripts**: Click the "Edit" button to modify script content
5. **Run Scripts**: Click the "Run" button to execute scripts
6. **Monitor Execution**: Switch to the Active view to see running scripts
7. **Review History**: Check the History view for past execution results

## Key Workflows

### Creating and Running a Script

1. Navigate to Scripts view
2. Right-click in file tree → Create new script
3. Enter script name (`.sh` extension added automatically)
4. Click "Edit" to add script content
5. Click "Save" to save changes
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

## Tips

- Use descriptive names for your scripts
- Organize scripts in logical folder structures
- Monitor the Active view for long-running scripts
- Check the History view regularly for execution results
- Use the search functionality to quickly find specific scripts



