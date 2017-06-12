  "/": {
      "target": "https://paperplane.basecamphq.com",
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      "pathRewrite": { "^/proxy": "" }
  }


  $.ajax({
      url: "https://basecamp.com/1759127/api/v1/projects.json",
      contentType: "application/json",
      dataType: "json",
      beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("parvez@paperplane.net" + ":" + "Foucault84"));
      },
      success: function(response) {
          console.log(response);
      },
      error: function(jqXHR, statusText, errorThrown) {
          $.error(jqXHR.statusText);
      }
  });

  Inject jquery in page

  var x = document.createElement('script');
  x.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.0/jquery.min.js";
  x.type = "text/javascript";
  document.head.appendChild(x);


  var x = document.createElement('script');
  x.src = "https://basecamp.com/";
  x.type = "text/"

  displayTasks(response) {
      var index;
      var parseString = require('xml2js').parseString;
      var xml = response["_body"];
      parseString(xml, function(err, responseData) {
          for (index = 0; index < responseData.records.length; index++) {
              this.people.push({
                  name: responseData.records[index].name,
                  email: responseData.records[index].emailAddress
              });
          }
      });
  }

  $.ajax({
      url: "https://paperplane.basecamphq.com/todo_lists.xml",
      headers: { 'Authorization': 'Bearer ' + localStorage.access_token },
      type: 'GET',
      dataType: "xml",
      success: function(response) {
          debugger;
          console.log(response);
      }
  });
  var url = "https://launchpad.37signals.com/authorization/token?type=web_server&client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A4200%2F&client_secret=67090f417bb8ef3d26f9aab9529e394539984f5d&code=d79842da";

  $.ajax({
      url: url,
      type: 'POST',
      dataType: "json",
      success: function(response) {
          localStorage.setItem('access_token', response.access_token);
          console.log(response);
      }
  });
  var url = "https://launchpad.37signals.com/authorization/token?type=web_server&client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A4200%2F&client_secret=67090f417bb8ef3d26f9aab9529e394539984f5d&code=7eef94de";

  $.ajax({
      url: url,
      type: 'POST',
      dataType: "json",
      success: function(response) {
          debugger;
          console.log(response);
          $.ajax({
              url: "https://paperplane.basecamphq.com/todo_lists.xml",
              data: { signature: authHeader },
              type: 'GET',
              dataType: "xml",
              beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + response.access_token); },
              success: function(response) {
                  debugger;
                  console.log(response);
              }
          });
      }
  });
  $.ajax({
      url: "https://paperplane.basecamphq.com/todo_lists.xml",
      headers: { 'Access-Control-Allow-Origin': '*' },
      type: 'GET',
      username: "parvez@paperplane.net",
      password: "Foucault84",
      crossDomain: true,
      withCredentials: true,
      dataType: "xml",
      success: function(response) {
          console.log(response);
      }
  });

  chrome.runtime.onMessage.addListener(function(request, sender, callback) {
      $.ajax({
          type: "GET",
          dataType: 'html',
          url: "https://basecamp.com/1759127/api/v1/projects.json",
          username: "parvez@paperplane.net",
          password: "Foucault84",
          success: function(response) {
              console.log(response);
          }
      });
  });


  $.ajax({
      method: 'GET',
      url: 'https://basecamp.com/1759127/api/v1/projects.json',
      headers: {
          'Accept': 'application/json',
          'X-Proxy-Url': 'https://basecamp.com/1759127/api/v1/projects.json'
      },
      data: { "username": "parvez@paperplane.net", "password": "Foucault84" },
      success: function(response) {
          console.log(response);
      }
  });


  https: //paperplane.basecamphq.com/projects.json?username=parvez@paperplane.net&password=Foucault84