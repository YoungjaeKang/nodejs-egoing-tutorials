var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

function templateHTML(title, list, body) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    <a href="/create">create</a>
    ${body}
  </body>
  </html>
  `;
}

function templateList(filelist) {
  var list = "<ul>";
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</ul>";
  return list;
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  // console.log(pathname);
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        // console.log(filelist);
        var title = "Welcome!!";
        var description = "Hello, Node.js";
        var list = templateList(filelist);
        var body = `<h2>${title}</h2><p>${description}</p>`;
        var template = templateHTML(title, list, body);

        response.writeHead(200);
        response.end(template);
      });

      // response.end(fs.readFileSync(__dirname + _url)); // end()안에 있는 것들이 렌더링되어서 나온다.
    } else {
      fs.readdir("./data", function (error, filelist) {
        var list = templateList(filelist);

        fs.readFile(
          `data/${queryData.id}`,
          "utf8",
          function (err, description) {
            var title = queryData.id;
            var body = `<h2>${title}</h2><p>${description}</p>`;
            var template = templateHTML(title, list, body);

            response.writeHead(200);
            response.end(template);
            // response.end(fs.readFileSync(__dirname + _url)); // end()안에 있는 것들이 렌더링되어서 나온다.
          }
        );
      });
    }
  } else if (pathname === '/create') {
    fs.readdir("./data", function (error, filelist) {
      // console.log(filelist);
      var title = "WEB - create";

      var list = templateList(filelist);
      var body = `
      <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="decsription"></textarea></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `;
      var template = templateHTML(title, list, body);

      response.writeHead(200);
      response.end(template);
    });

  } else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function(data) {
      body += data;
      // post 방식으로 전송되는 데이터가 많을 경우를 대비
      // if (body.length > 1e6)
      //   request.connection.destroy();
    });
    request.on('end', function(){
      var post = qs.parse(body);
      // console.log(post);
      // console.log(post.title);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end("success");
      })
    });

  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});
app.listen(3000);
