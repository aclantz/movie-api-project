const http = require("http"),
  url = require("url"),
  fs = require("fs");

http
  .createServer((request, response) => {
    let addr = request.url,
      q = new URL(addr, "http//localhost:8080"),
      filePath = "";

    //creating a log for server requests, appending them to log.txt
    fs.appendFile(
      "log.txt",
      "URL: " + addr + "\nTimestamp: " + new Date() + "\n\n",
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Added to log");
        }
      }
    );

    //returns documentation file if requested
    if (q.pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html";
    } else {
      filePath = "index.html";
    }

    //retrieves the files requested
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }
    });

    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write(data);
    response.end("Hello Node!\n");
  })
  .listen(8080);

console.log("My first Node test server is running on Port 8080.");
