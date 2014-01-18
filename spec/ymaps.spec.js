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

        function YaEvent(data) {
            this.get = function(key) {
                return data[key];
            };
        }
        beforeEach(module(function($provide) {
            mapMock = {
                events: jasmine.createSpyObj('mapEvents', ['add']),
                panTo: jasmine.createSpy('panSpy'),
                setBounds: jasmine.createSpy('mapBounds'),
                setZoom: jasmine.createSpy('zoomSpy'),
                controls: jasmine.createSpyObj('mapObjControls', ['add']),
                geoObjects: jasmine.createSpyObj('mapObjElements', ['add'])
            };
            geoObjectsMock = {
                add: jasmine.createSpy('geoObjectsObjAdd'),
                remove: jasmine.createSpy('geoObjectsObjRemove'),
                getLength: jasmine.createSpy('geoObjectsGetLength').andReturn(3),
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
            $provide.value('debounce', angular.identity);
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

        function createMap() {
            createElement('<yandex-map center="center" zoom="zoom"></yandex-map>', {center: [55.23, 30.22], zoom: 10});
        }

        it('should create empty map with default center and zoom', function() {
            createElement('<yandex-map center="center" zoom="zoom"></yandex-map>');
            var mapConfig = ymapsMock.Map.mostRecentCall.args[1];
            expect(mapConfig.center).toEqual([0, 0]);
            expect(mapConfig.zoom).toBe(0);
        });

        it('should create empty map with selected center and zoom', function() {
            createMap();
            var mapConfig = ymapsMock.Map.mostRecentCall.args[1];
            expect(mapConfig.center).toEqual([55.23, 30.22]);
            expect(mapConfig.zoom).toBe(10);
        });

        it('should change map center when attribute has changed', function() {
            createMap();
            mapMock.panTo.reset();
            scope.$apply('center=[54.45, 31.16]');
            expect(mapMock.panTo).toHaveBeenCalledWith([54.45, 31.16]);
        });

        it('should change map zoom when attribute has changed', function() {
            createMap();
            mapMock.setZoom.reset();
            scope.$apply('zoom=12');
            expect(mapMock.setZoom).toHaveBeenCalledWith(12, {checkZoomRange: true});
        });

        it('should update model values of center and zoom', function() {
            createMap();
            var callback = mapMock.events.add.mostRecentCall.args[1];
            callback(new YaEvent({newCenter: [62.16, 34.56], newZoom: 23}));
            expect(scope.center).toEqual([62.16, 34.56]);
            expect(scope.zoom).toEqual(23);
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

        describe('auto fit', function() {
            it('should listen collection bounds', function() {
                createMap();
                expect(geoObjectsMock.events.add.mostRecentCall.args[0]).toBe('boundschange');
            });

            it('should update map bounds after event', function() {
                createMap();
                var callback = geoObjectsMock.events.add.mostRecentCall.args[1];
                callback(new YaEvent({
                    newBounds: [[55.23, 30.22], [58.35, 36.18]]
                }));
                expect(mapMock.setBounds).toHaveBeenCalled();
            });

            it('should not update map bounds when collection is empty', function() {
                createMap();
                geoObjectsMock.getLength.andReturn(0);
                var callback = geoObjectsMock.events.add.mostRecentCall.args[1];
                callback(new YaEvent({
                    newBounds: [[55.23, 30.22], [58.35, 36.18]]
                }));
                expect(mapMock.setBounds).not.toHaveBeenCalled();
            });
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
