/*globals jasmine, describe, beforeEach, it, afterEach, expect, angular, module, inject */
describe("Ymaps", function() {
    "use strict";
    beforeEach(module('ymaps'));

    describe('Loader', function() {
        var ymapsMock = window.ymaps = { ready: function(callback) {callback();}},
            $timeout, ymapsLoader;
        beforeEach(module('ymaps'));
        beforeEach(module(function($provide) {
            $provide.factory('$script', function($q, $timeout) {
                return function() {
                    var deferred = $q.defer();
                    $timeout(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                };
            });
        }));
        beforeEach(inject(function(_ymapsLoader_, _$timeout_) {
            $timeout = _$timeout_;
            ymapsLoader = _ymapsLoader_;
        }));
        it('should load script and call ready', function() {
            var callbackSpy = jasmine.createSpy('callback');
            ymapsLoader.ready(callbackSpy);
            $timeout.flush();
            expect(callbackSpy).toHaveBeenCalledWith(ymapsMock);
        });
    });

    describe('ymap-directive', function() {
        var $rootScope, $compile,
            scope, ymapsMock, mapMock, geoObjectsMock, placemarkMock;
        beforeEach(module(function($provide) {
            mapMock = {
                controls: jasmine.createSpyObj('mapObjControls', ['add']),
                geoObjects: jasmine.createSpyObj('mapObjElements', ['add'])
            };
            geoObjectsMock = {
                add: jasmine.createSpy('geoObjectsObjAdd'),
                remove: jasmine.createSpy('geoObjectsObjRemove'),
                events: jasmine.createSpyObj('geoObjectsObjEvents', ['add'])
            };
            placemarkMock = {
                properties: jasmine.createSpyObj('placemarkObjProperties', ['set'])
            };
            ymapsMock = {
                Map: jasmine.createSpy('map').andReturn(mapMock),
                GeoObjectCollection: jasmine.createSpy('geoObjectsCollection').andReturn(geoObjectsMock),
                Placemark: jasmine.createSpy('placemark').andReturn(placemarkMock)
            };
            $provide.value('ymapsLoader', { ready: function(callback) {callback(ymapsMock);}});
        }));
        beforeEach(inject(function(_$rootScope_, _$compile_) {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
        }));

        function createElement(html, scopeVal) {
            var element = angular.element(html);
            scope = $rootScope.$new();
            angular.extend(scope, scopeVal);
            $compile(element)(scope);
            scope.$apply();
        }

        it('should create empty map with default center and zoom', function() {
            createElement('<yandex-map center="center" zoom="zoom"></yandex-map>');
            var mapConfig = ymapsMock.Map.mostRecentCall.args[1];
            expect(mapConfig.center).toEqual([0, 0]);
            expect(mapConfig.zoom).toBe(0);
        });

        it('should create empty map with selected center and zoom', function() {
            createElement('<yandex-map center="center" zoom="zoom"></yandex-map>', {center: [55.23, 30.22], zoom: 10});
            var mapConfig = ymapsMock.Map.mostRecentCall.args[1];
            expect(mapConfig.center).toEqual([55.23, 30.22]);
            expect(mapConfig.zoom).toBe(10);
        });

        it('should add nested markers to map', function() {
            createElement(
                '<yandex-map center="center" zoom="zoom">' +
                    '<ymap-marker coordinates="marker1"></ymap-marker>'+
                    '<ymap-marker coordinates="marker2"></ymap-marker>'+
                '</yandex-map>',
                {marker1: [55.23, 30.22], marker2: [45.15, 34.47]}
            );
            expect(ymapsMock.Placemark.calls[0].args[0]).toEqual([55.23, 30.22]);
            expect(ymapsMock.Placemark.calls[1].args[0]).toEqual([45.15, 34.47]);
            expect(geoObjectsMock.add.calls.length).toBe(2);
        });

        describe('with ngRepeat', function() {
            beforeEach(function() {
                createElement(
                    '<yandex-map center="center" zoom="zoom">' +
                        '<ymap-marker coordinates="marker" index="$index+1" ng-repeat="marker in markers"></ymap-marker>'+
                        '</yandex-map>',
                    {markers: [[55.23, 30.22], [45.15, 34.47]]}
                );
            });

            it('should add array of markers', function() {
                expect(geoObjectsMock.add.calls.length).toBe(2);
                expect(ymapsMock.Placemark.calls[0].args[0]).toEqual([55.23, 30.22]);
                expect(ymapsMock.Placemark.calls[1].args[0]).toEqual([45.15, 34.47]);
            });

            it('should add new markers', function() {
                scope.markers.push([40.42, 45.30]);
                scope.$apply();
                expect(geoObjectsMock.add.calls.length).toBe(3);
                expect(ymapsMock.Placemark.mostRecentCall.args[0]).toEqual([40.42, 45.30]);
            });

            it('should remove markers and update indexes', function() {
                scope.markers.splice(0, 1);
                scope.$apply();
                expect(geoObjectsMock.remove.calls.length).toBe(1);
                expect(placemarkMock.properties.set.calls.length).toBe(1);
                expect(placemarkMock.properties.set).toHaveBeenCalledWith('iconContent', 1);
            });
        });
    });
});
