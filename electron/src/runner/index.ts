/**

should be accessible by both the electron ipc and http
script output is simultaneously buffered on the server and sent to clients 
database with execution history
all client static files should be accessible over http
connecting client should receive the number of active and recently finished scripts
list of active and finished scripts sent only on request as well as scripts output
clients can attach to live output streams of any scripts and detach from it
each output line should be timestamped so that clients can ask for lines older than the last one they have
changes in scripts activity status should be pushed to clients

*/
