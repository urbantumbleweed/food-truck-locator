'use strict';

var _ = require('lodash');
var expect = require('expect');
var sinon = require('sinon');
var Promise = require('bluebird');

var path = require('path');


// Modules to test
var Truck = require(path.join(__dirname, '../../src/server/models/Truck'));

var sampleData = [
    { location:
       { needs_recoding: false,
         longitude: '-122.408040736128',
         latitude: '37.7834700798603' },
      status: 'REQUESTED',
      permit: '11MFF-0175',
      block: '3704',
      received: 'Sep 26 2011  1:06PM',
      facilitytype: 'Push Cart',
      blocklot: '3704001',
      locationdescription: 'MARKET ST: 05TH ST \\ CYRIL MAGNIN ST to MASON ST \\ TURK ST (901 - 941) -- SOUTH --',
      cnn: '8748101',
      priorpermit: '0',
      schedule: 'http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=11MFF-0175&ExportPDF=1&Filename=11MFF-0175_schedule.pdf',
      address: '901 MARKET ST',
      applicant: 'Halal Cart',
      lot: '001',
      fooditems: 'Kebab: Halal Gyros: Grilled Halal Meat: Beverages',
      longitude: '-122.408040736138',
      latitude: '37.7834700660829',
      objectid: '334914',
      y: '2113361.952',
      dayshours: 'Sa-Su:12AM-3AM;Mo-Su:10AM-8PM;Fr/Sa:9PM-12AM',
      x: '6010303.105' },
    { location:
       { needs_recoding: false,
         longitude: '-122.403191783219',
         latitude: '37.7783886295689' },
      status: 'EXPIRED',
      expirationdate: '2014-03-15T00:00:00',
      permit: '13MFF-0102',
      block: '3753',
      received: 'Apr 12 2013  2:33PM',
      facilitytype: 'Truck',
      blocklot: '3753241',
      locationdescription: 'HARRISON ST: MERLIN ST to OAK GROVE ST (924 - 950)',
      cnn: '6721000',
      priorpermit: '1',
      approved: '2013-04-12T14:43:48',
      schedule: 'http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=13MFF-0102&ExportPDF=1&Filename=13MFF-0102_schedule.pdf',
      address: '950 HARRISON ST',
      applicant: 'Natan\'s Catering',
      lot: '241',
      fooditems: 'Burgers: melts: hot dogs: burritos:sandwiches: fries: onion rings: drinks',
      longitude: '-122.403191783229',
      latitude: '37.7783886157866',
      objectid: '437214',
      y: '2111483.53704',
      dayshours: 'Mo-Fr:12PM-1PM',
      x: '6011666.48064' }
    ];

function requestData(){
  return new Promise.resolve(sampleData);
}

var fakerData = null;
var tags = null;

describe('Truck', function() {

  beforeEach(function(){
    fakerData = requestData();
  });

  afterEach(function(){
    fakerData = null;
    tags = null;
  });

  describe('#getTrucksByLocation', function(){
    var query = {};
    beforeEach(function(){
      query.latitude = 37.7804739;
      query.longitude = -122.40616800000001;

    });

    it('should throw an error if `latitude` is missing', function(){
      expect(function(){
        Truck.getTrucksByLocation({
          longitude: query.longitude
        })
      }).toThrow(/Latitude/);
    });

    it('should throw an error if `longitude` is missing', function(){
      expect(function(){
        Truck.getTrucksByLocation({
          latitude: query.latitude
        })
      }).toThrow(/Longitude/);
    });

    it('should not require a value for `radius`', function(done){
      expect(function(){
        Truck.getTrucksByLocation({
          latitude: query.latitude,
          longitude: query.longitude
        })
      }).toNotThrow();
      done();
    });

    it('should not require value for `limit`', function(done){
      expect(function(){
        Truck.getTrucksByLocation({
          latitude: query.latitude,
          longitude: query.longitude
        })
      }).toNotThrow();
      done();
    });
  });

  describe('#_transformTruckData()', function(){
    var clientData = null;
    var tags = null;

    beforeEach(function(){
      clientData = fakerData
        .then(function(data){
          return Truck._transformTruckData(data);
        });
      tags = [
        'Burgers' ,
        'Melts',
        'Hot dogs',
        'Burritos',
        'Sandwiches',
        'Fries',
        'Onion rings',
        'Drinks'
      ];
    });

    afterEach(function(){
      clientData = null;
      tags = null;
    });

    it('should return an object', function (done) {
        clientData.then(function(clientData){
          expect(clientData).toBeA('object');
          done();
        });
    });

    it('should return an object with a `trucks` property', function(done){
      clientData.then(function(clientData){
        expect(Object.keys(clientData)).toInclude('trucks');
        done();
      });
    });

    it('should return with a trucks property with length ' + sampleData.length, function(done){
      clientData.then(function(clientData){
        expect(clientData.trucks.length).toBe(sampleData.length);
        done();
      });
    });

    it('should return with a trucks property that contains truck objects', function(done){
      clientData.then(function(clientData){
        var truck = clientData.trucks[0];
        expect(truck).toBeA('object');
        expect(truck.objectId).toBeA('string');
        expect(truck.applicant).toBeA('string');
        expect(truck.facilityType).toBeA('string');
        expect(truck.locationDescription).toBeA('string');
        expect(truck.foodItems).toBeA('string');
        expect(truck.latitude).toBeA('string');
        expect(truck.longitude).toBeA('string');
        expect(truck.daysHours).toBeA('string');
        expect(truck.location).toBeA('object');
        expect(truck.location).toBeA('object');
        done();
      });
    });

    it('should return an object with a `tags` property', function(done){
      clientData.then(function(clientData){
        expect(Object.keys(clientData)).toInclude('trucks');
        done();
      });
    });

    it('should return an object of unique tags', function(done){
      clientData.then(function(clientData){
        expect(_.chain(clientData.tags)
          .map(function(val){
            return val;
          })
          .uniq()
          .size()
          .value() === _.size(clientData.tags)).toBe(true);
        done();
      });
    });

    it('should convert a colon delimted string into an array of tags', function(done){
      fakerData.then(function(data){
        return data[1].fooditems;
      })
      .then(function(initialString){
        expect(initialString).toBe(sampleData[1].fooditems + '');
        return clientData;
      })
      .then(function(clientData){
        var processed = clientData.trucks[1].tags;
        expect(_.isEqual(tags, processed)).toBe(true);
        done();
      })
      .catch(function(err){
        done(err);
      })
    });
  });

  describe('#_makeTaggedTruck()', function(){
    var data = null;
    beforeEach(function(){
      tags = [
        'Burgers',
        'Melts',
        'Hot dogs',
        'Burritos',
        'Sandwiches',
        'Fries',
        'Onion rings',
        'Drinks'
      ];
      data = sampleData[1];
    });

    it('should return a Truck object', function(){
      expect(Truck._makeTaggedTruck(data, tags)).toBeA('object');
    });

    it('should return a Truck with a `tags` property', function(){
      expect(Truck._makeTaggedTruck(data, tags).tags).toExist();
    });

    it('should return a Truck with a `tags` property that is an Array', function(){
      expect(Truck._makeTaggedTruck(data, tags).tags instanceof Array).toBe(true);
    });

    it('should return a Truck with the right number of tags', function(){
      expect(Truck._makeTaggedTruck(data, tags).tags.length).toBe(tags.length);
    });
  });

  describe('#_tagMap()', function(){
    var objToChange = null;

    beforeEach(function(){
      objToChange = {
        trucks: [],
        tags: {}
      };
      tags = [
        'Burgers' ,
        'Melts',
        'Hot dogs',
        'Burritos',
        'Sandwiches',
        'Fries',
        'Onion rings',
        'Drinks'
      ];
    });

    afterEach(function(){
      objToChange = null;
    });

    it('should return undefined', function(){
      expect(Truck._tagMap(tags, objToChange)).toBe(undefined);
    });

    it('should add tags to the `mapObj` if they are not present', function(){
      expect(_.size(objToChange.tags)).toBe(0);
      Truck._tagMap(tags, objToChange);
      expect(_.size(objToChange.tags)).toBe(tags.length);
    });

    it('should not add duplicate tags to `mapObj`', function(){
      var correctLength = tags.length;
      tags.push('Drinks', 'Melts', 'Burgers');
      Truck._tagMap(tags, objToChange);
      expect(_.size(objToChange.tags)).toBe(correctLength);
    });
  });

  describe('#_taggify()', function(){
    var tags = null;

    beforeEach(function(){
      tags = 'Burgers: melts: hot dogs: burritos:sandwiches: fries: onion rings: drinks';
    });

    afterEach(function(){
      tags = null;
    });

    it('should return an array', function(){
      expect(Truck._taggify(tags) instanceof Array).toBe(true);
    });

    it('should parse tags from a string', function(){
      expect(Truck._taggify(tags).length).toBe(8);
    });

    it('should capitalize each tag generated', function(){
      var items = Truck._taggify(tags);
      var lowercase = _.reject(items, function(tag){
        return tag.charAt(0) === tag.charAt(0).toUpperCase();
      });
      expect(lowercase.length).toBe(0);
    });
  });
});
