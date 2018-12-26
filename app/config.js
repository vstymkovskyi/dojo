const dojoConfig = {
  async: true,
  packages: [{
    name: "app",
    location: location.pathname.replace(/\/[^/]*$/, '') + '/app'
  }]
};