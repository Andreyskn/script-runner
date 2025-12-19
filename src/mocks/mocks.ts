type MockFile = {
	name: string;
	text: string;
};

export const newScriptText = `
#!/bin/sh

# Available commands (in this demo):

# echo  - Prints a message to stdout
# error - Prints a message to stderr
# sleep - Pauses execution (seconds)
# date  - Prints formatted timestamp
# exit  - Terminates script

# Double-click to edit. Ctrl+S to save.
`.trim();

export const files: MockFile[] = [
	{
		name: '⭐ user-manual.sh',
		text: String.raw`
#!/bin/sh

echo Key Workflows:
sleep 0.5

echo \\nCreating and Running a Script
sleep 0.5

echo "  1. Navigate to Scripts view"
sleep 0.1
echo "  2. Right-click in file tree → Create new script"
sleep 0.1
echo "  3. Enter script name"
sleep 0.1
echo "  4. Click \"Edit\" to add script content (or double click the code area)"
sleep 0.1
echo "  5. Click \"Save\" to save changes (or press Ctrl+S)"
sleep 0.1
echo "  6. Click \"Run\" to execute the script"
sleep 0.1
echo "  7. Monitor output in real-time"
sleep 1

echo \\nManaging Script Organization
sleep 0.5

echo "  1. Create folders by right-clicking in file tree"
sleep 0.1
echo "  2. Drag and drop scripts between folders"
sleep 0.1
echo "  3. Rename files/folders by right-clicking and selecting rename"
sleep 0.1
echo "  4. Delete unwanted files"
sleep 1

echo \\nMonitoring Executions
sleep 0.5

echo "  1. Switch to Active view to see running scripts"
sleep 0.1
echo "  2. Click on script names to jump to the script editor"
sleep 0.1
echo "  3. View real-time output and execution status"
sleep 0.1
echo "  4. Check History view for completed executions"
sleep 1

echo \\nPress Ctrl+P to quickly search and open a file by its name.
`.trim(),
	},
	{
		name: 'long-running.sh',
		text: `
#!/bin/sh

echo Currently running scripts are in the Active tab

date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
date
sleep 5
`.trim(),
	},
	{
		name: 'test.sh',
		text:
			newScriptText +
			`

echo echo
error error
sleep 1
date
exit 0
echo unreachable
`,
	},
];
