var request = new XMLHttpRequest();

request.open('POST', '/api/GetTestStatus', true);
request.onload = function () {
  // Begin accessing JSON data here
  var data = JSON.parse(this.response);

  if (request.status >= 200 && request.status < 400) {
    data.forEach((entity) => {
      console.log(entity.class, entity.status);
    });
  } else {
    console.log('error');
  }
};

request.send();
