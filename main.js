var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require('./lib/template.js');
var path = require('path'); // 이걸로 하지 않으면 readfile이 있는 곳에서 외부에서 경로를 탐색해서 내 폴더를 볼 수 있음
var sanitizeHtml = require('sanitize-html');

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
        var list = template.list(filelist);
        var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create?id=${title}">create</a>`);

        response.writeHead(200);
        response.end(html);
      });

      // response.end(fs.readFileSync(__dirname + _url)); // end()안에 있는 것들이 렌더링되어서 나온다.
    } else {
      fs.readdir("./data", function (error, filelist) {
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(
          `data/${filteredId}`,
          "utf8",
          function (err, description) {
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            var html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
            `<a href="/create">create</a>
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action="delete_process" method="post" onsubmit="javascript">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`);
            // delete는 a태그로 구현하는 GET방식으로 구현하면 안되고 POST로 해야 함



            response.writeHead(200);
            response.end(html);
            // response.end(fs.readFileSync(__dirname + _url)); // end()안에 있는 것들이 렌더링되어서 나온다.
          }
        );
      });
    }
  } else if (pathname === '/create') {
    fs.readdir("./data", function (error, filelist) {
      // console.log(filelist);
      var title = "WEB - create";

      var list = template.list(filelist);
      var body = `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="decsription"></textarea></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `;
      var html = template.HTML(title, list, body, '');

      response.writeHead(200);
      response.end(html);
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
  } else if (pathname === '/update') {
    fs.readdir("./data", function (error, filelist) {
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(
        `data/${filteredId}`,
        "utf8",
        function (err, description) {
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list, `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="decsription">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?=${title}">update</a>`);
          

          response.writeHead(200);
          response.end(html);
          // response.end(fs.readFileSync(__dirname + _url)); // end()안에 있는 것들이 렌더링되어서 나온다.
        }
      );
    });
  } else if (pathname === '/update_process') {
    var body = '';
    request.on('data', function(data) {
      body += data;
      // post 방식으로 전송되는 데이터가 많을 경우를 대비
      // if (body.length > 1e6)
      //   request.connection.destroy();
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end("success");
          })
          console.log(post);
        })
    });
  } else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function(data) {
      body += data;
      // post 방식으로 전송되는 데이터가 많을 경우를 대비
      // if (body.length > 1e6)
      //   request.connection.destroy();
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(error) {
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    });
  } else {
    response.writeHead(404);
    response.end("Not Found");
  }
});
app.listen(3000);
