var http = require("http");
var fs = require("fs");
var url = require("url");

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        // console.log(filelist);
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = "<ul>";
        var i = 0;
        while (i < filelist.length) {
          list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
          i = i + 1;
        }
        list = list + "</ul>";

        var template = `
            <!doctype html>
            <html>
            <head>
              <title>WEB1 - ${queryData.id}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1><a href="/">WEB</a></h1>
              ${list}
              <h2>${queryData.id}</h2>
              <p>${description}
              </p>
            </body>
            </html>
          `;
        response.writeHead(200);
        response.end(template);
      });

      // response.end(fs.readFileSync(__dirname + _url)); // end()안에 있는 것들이 렌더링되어서 나온다.
    } else {
      fs.readdir("./data", function (error, filelist) {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = "<ul>";
        var i = 0;
        while (i < filelist.length) {
          list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
          i = i + 1;
        }
        list = list + "</ul>";

        fs.readFile(
          `data/${queryData.id}`,
          "utf8",
          function (err, description) {
            var title = queryData.id;
            var template = `
            <!doctype html>
            <html>
            <head>
              <title>WEB1 - ${queryData.id}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1><a href="/">WEB</a></h1>
              ${list}
              <h2>${queryData.id}</h2>
              <p>${description}
              </p>
            </body>
            </html>
          `;

            response.writeHead(200);
            response.end(template);
            // response.end(fs.readFileSync(__dirname + _url)); // end()안에 있는 것들이 렌더링되어서 나온다.
          }
        );
      });
    }
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});
app.listen(3000);
