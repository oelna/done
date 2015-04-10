# Done
A simple webapp that helps to keep track of things.

The app presents an overview of 7 days, with checkboxes for tasks completed on a given day. You can flip through weeks, add new tasks, remove tasks and start over (via the dangerous "Purge" button).

The CSS is very basic and can be easily modified. The javascript is, well, the best I could do. I tried to annotate as best I could and you can turn on console logging with the `oelna.done.debug` flag.

Data is stored in your browser via javascript IndexedDB. For now, external references are the YUI CSS reset and the jQuery library, but these could easily be included directly if you wanted to make the app self-contained. The project also uses [db.js](//github.com/aaronpowell/db.js), because IndexedDB is hard.

For the future I hope to build some sort of export into it, so the data can be saved when switching browsers or devices. I'm also thinking about a server-based SQLite version. Some kind of statistics would also be nice, maybe in the form of sparklines or other simple SVG images.

I'm providing this for free, as a resource for others to use. If you like it and do something cool with it, I'd love to hear about it. Please understand, that I can't offer support. If you make any improvements to the code, feel free to send a pull request and I'll have a look.
