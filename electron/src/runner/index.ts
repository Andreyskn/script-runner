/**

step 1:
- [x] script output is simultaneously buffered on the server and sent to clients
- [x] clients can attach to live output streams of any scripts and detach from it
- [x] clients can request active script's full output
- [x] changes in scripts activity status should be pushed to clients

step 2:
- [] database with execution history
- [] all client static files should be accessible over http

step 3:
- [] configurable script path
- [] multiple instances of a single script
- [] parametrization, profiles, dialogs for script data (?)
- [] running scripts indication in file tree and possibly in tray/os notifications

future:
- scheduled autorun
- interactive terminal
- code editor

notes:
- Use a single output stream per script with sequential line numbers and timestamps.
- Determine whether to deliver historical lines on connect or only new lines after connection.
- Consider a “tail” mode for clients requesting only the most recent N lines.
- Ensure server-held buffers have configurable size limits and eviction policies.
*/
