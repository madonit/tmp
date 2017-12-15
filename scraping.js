"use strict";

var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    json2csv = require('json2csv');

var csvFields = ["Title", "SKU", "ImgURL", "Description"];

var data = [],
    shirtArray = [],
    shirtToScrap = [];

var dir = "./data",
    errorFile = 'scraper-error.log',
    url = 'http://b2bdvc.ru/120_Avtomagnitoly/35929_Avtomagnitola_pioneer_mvh_x460ui';


request(url, function(error, response, body) {
  if(!error && response.statusCode == 200) {
    
    /** Create jQuery like object */
		var $ = cheerio.load(body);

      /** Create an object to hold the shirt detail */
      var json = {}
          

          json.Title = $('h2').text().trim();
          json.SKU = $('div.product-code small').text().trim();
          json.ImgURL = $('div.main-image img').attr('src');
          json.Description = $('p.product-description').text().trim();
          
          var today = new Date();
          json.Time = today; // Time of extraction
          
          /** Store shirt details into an array */
          data.push(json);
          
          /** Create folder called 'data' if it is not already exists */
          if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          };
          
          /** Create csv file with today's file name */
          var dd = today.getDate();
          var mm = today.getMonth() + 1 ;
          var yyyy = today.getFullYear();
          var csvFileName = yyyy + "-" + dd + "-" + mm + ".csv";
    
          /** Convert json data into csv format using node module json2csv */
          json2csv({data:data, fields:csvFields}, function(err, csv) {
          
            if (err) throw err;
            /** If the data file for today already exists it should overwrite the file */
            fs.writeFile(dir + "/" + csvFileName, csv, function(err) {
              if (err) {console.log("Error!");}
              else{console.log(csvFileName + ' created');}
            }); //End fo writeFile
          
          }); // End of json2csv method
  
    console.log('\n' + "Done." + '\n' );
  }
  else {
    printErrorMessage(error)
  }

});// End of request method

function printErrorMessage(error) {

  console.log('Error occured while scrapping site ' + url);
  
  var errorMsg = "[" + Date() + "]" + " : " + error + "\n";
  fs.appendFile(errorFile, errorMsg, function(err) {
    if (err) throw err;
    console.log('Error was logged into "scraper-error.log" file');
  });
}
