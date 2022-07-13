"use strict";

module.exports = (function () {
  function Parser(argsList){
    this.argsList = argsList.map(function (a) {
      return a;
    })
  }


  Parser.prototype.getPort = function (port) {
    if (this.argsList.indexOf("-p") !== -1) {
      let strPort =  this.argsList[this.argsList.indexOf("-p") + 1];
      return parseInt(strPort);
    } 

    return 3200
  };

  return Parser;
})()
