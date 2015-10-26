/*globals jasmine, describe, beforeEach, it, afterEach, expect, angular, module, inject */
describe('Ymaps', function() {
    'use strict';
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
            $provide.value('debounce', angular.identity);
            $provide.factory('ymapsLoader', function($q) {
                mapMock = {
                    options: jasmine.createSpyObj('mapOptions', ['get', 'set']),
                    events: jasmine.createSpyObj('mapEvents', ['add']),
                    panTo: jasmine.createSpy('panSpy').and.callFake(function() {
                        this.deferred = $q.defer();
                        this.deferred.promise.always = this.deferred.promise.finally;
                        return this.deferred.promise;
                    }),
                    setBounds: jasmine.createSpy('mapBounds').and.callFake(function() {
                        this.deferred = $q.defer();
                        this.deferred.promise.always = this.deferred.promise.finally;
                        return this.deferred.promise;
                    }),
                    setZoom: jasmine.createSpy('zoomSpy'),
                    controls: jasmine.createSpyObj('mapObjControls', ['add']),
                    geoObjects: jasmine.createSpyObj('mapObjElements', ['add'])
                };
                geoObjectsMock = {
                    add: jasmine.createSpy('geoObjectsObjAdd'),
                    remove: jasmine.createSpy('geoObjectsObjRemove'),
                    getLength: jasmine.createSpy('geoObjectsGetLength').and.returnValue(3),
                    getBounds: jasmine.createSpy('geoObjectsGetBounds'),
                    events: jasmine.createSpyObj('geoObjectsObjEvents', ['add'])
                };
                placemarkMock = {
                    properties: jasmine.createSpyObj('placemarkObjProperties', ['set'])
                };
                ymapsMock = {
                    Map: jasmine.createSpy('map').and.returnValue(mapMock),
                    GeoObjectCollection: jasmine.createSpy('geoObjectsCollection').and.returnValue(geoObjectsMock),
                    Placemark: jasmine.createSpy('placemark').and.returnValue(placemarkMock)
                };
                return {
                    ready: function(callback) {callback(ymapsMock);}
                };
            });
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
            mapMock.deferred.resolve();
            mapMock.panTo.calls.reset();
            scope.$apply();
        }

        it('should create empty map with default center and zoom', function() {
            createElement('<yandex-map center="center" zoom="zoom"></yandex-map>');
            var mapConfig = ymapsMock.Map.calls.argsFor(0)[1];
            expect(mapConfig.center).toEqual([0, 0]);
            expect(mapConfig.zoom).toBe(0);
        });

        //fix issue #4
        it('should work with spaces inside', function() {
            createElement('<yandex-map center="center" zoom="zoom"> </yandex-map>');
        });

        it('should create empty map with selected center and zoom', function() {
            createMap();
            var mapConfig = ymapsMock.Map.calls.argsFor(0)[1];
            expect(mapConfig.center).toEqual([55.23, 30.22]);
            expect(mapConfig.zoom).toBe(10);
        });

        it('should change map center when attribute has changed', function() {
            createMap();
            mapMock.panTo.calls.reset();
            scope.$apply('center=[54.45, 31.16]');
            expect(mapMock.panTo).toHaveBeenCalledWith([54.45, 31.16]);
        });

        it('should change map zoom when attribute has changed', function() {
            createMap();
            mapMock.setZoom.calls.reset();
            scope.$apply('zoom=12');
            expect(mapMock.setZoom).toHaveBeenCalledWith(12, {checkZoomRange: true});
        });

        it('should update model values of center and zoom', function() {
            createMap();
            var callback = mapMock.events.add.calls.mostRecent().args[1];
            callback(new YaEvent({newCenter: [62.16, 34.56], newZoom: 23}));
            expect(scope.center).toEqual([62.16, 34.56]);
            expect(scope.zoom).toEqual(23);
        });

        it('should ignore bounds change while center is moving', function() {
            createMap();
            scope.center = [45.15, 34.47];
            scope.$apply();
            var callback = mapMock.events.add.calls.mostRecent().args[1];
            callback(new YaEvent({newCenter: [62.16, 34.56], newZoom: 23}));
            expect(scope.center).toEqual([45.15, 34.47]);
            mapMock.deferred.resolve();
            scope.$apply();
            callback(new YaEvent({newCenter: [62.16, 34.56], newZoom: 23}));
            expect(scope.center).toEqual([62.16, 34.56]);
        });

        it('should add nested markers to map', function() {
            createElement(
                '<yandex-map center="center" zoom="zoom">' +
                    '<ymap-marker coordinates="marker1"></ymap-marker>'+
                    '<ymap-marker coordinates="marker2" options="options"></ymap-marker>'+
                '</yandex-map>',
                {marker1: [55.23, 30.22], marker2: [45.15, 34.47], options: {preset: 'islands#icon', iconColor: '#a5260a'}}
            );
            expect(ymapsMock.Placemark.calls.argsFor(0)[0]).toEqual([55.23, 30.22]);
            expect(ymapsMock.Placemark.calls.argsFor(1)[0]).toEqual([45.15, 34.47]);
            expect(ymapsMock.Placemark.calls.argsFor(1)[2]).toEqual({preset: 'islands#icon', iconColor: '#a5260a'});
            expect(geoObjectsMock.add.calls.count()).toBe(2);
        });

        describe('auto fit', function() {
            it('should listen collection bounds', function() {
                createMap();
                expect(geoObjectsMock.events.add).toHaveBeenCalledWith('boundschange', jasmine.any(Function));
            });

            it('should update map bounds after event', function() {
                createMap();
                geoObjectsMock.getBounds.and.returnValue([[55.23, 30.22], [58.35, 36.18]]);
                var callback = geoObjectsMock.events.add.calls.argsFor(0)[1];
                callback();
                expect(mapMock.setBounds).toHaveBeenCalledWith([[ 55.23, 30.22 ], [ 58.35, 36.18 ]], { checkZoomRange: true, zoomMargin: 40 });
            });

            it('should not update map bounds when collection is empty', function() {
                createMap();
                geoObjectsMock.getLength.and.returnValue(0);
                var callback = geoObjectsMock.events.add.calls.argsFor(0)[1];
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
                expect(geoObjectsMock.add.calls.count()).toBe(2);
                expect(ymapsMock.Placemark).toHaveBeenCalledWith([55.23, 30.22], jasmine.any(Object), undefined);
                expect(ymapsMock.Placemark).toHaveBeenCalledWith([45.15, 34.47], jasmine.any(Object), undefined);
            });

            it('should add new markers', function() {
                scope.markers.push([40.42, 45.30]);
                scope.$apply();
                expect(geoObjectsMock.add.calls.count()).toBe(3);
                expect(ymapsMock.Placemark).toHaveBeenCalledWith([40.42, 45.30], jasmine.any(Object), undefined);
            });

            it('should remove markers and update indexes', function() {
                scope.markers.splice(0, 1);
                scope.$apply();
                expect(geoObjectsMock.remove.calls.count()).toBe(1);
                expect(placemarkMock.properties.set.calls.count()).toBe(1);
                expect(placemarkMock.properties.set).toHaveBeenCalledWith('iconContent', 1);
            });
        });
    });
});
