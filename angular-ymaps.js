angular.module('ymaps', ['script'])
.constant('ymapConfig', {
    mapBehaviors: ['default'],
    markerOptions: {
        preset: 'twirl#darkgreenIcon'
    },
    fitMarkers: true
})
.controller('YmapController', ['$scope', function ($scope) {
    "use strict";
    this.addMarker = function(coordinates, properties) {
        var placeMark = new ymaps.Placemark(coordinates, properties);
        $scope.markers.add(placeMark);
        return placeMark;
    };
    this.removeMarker = function (marker) {
        $scope.markers.remove(marker);
    };
}])
.directive('yandexMap', ['$compile', '$script', 'ymapConfig', function ($compile, $script, config) {
    "use strict";
    function initAutoFit(map, collection) {
        //brought from underscore http://underscorejs.org/#debounce
        function debounce(func, wait) {
            var timeout = null;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    func.apply(context, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        var markerMargin = 0.1,
            fitMarkers = debounce(function (event) {
                var bounds = event.get('newBounds'),
                //make some margins from
                    topRight = [
                        bounds[1][0] + markerMargin,
                        bounds[1][1] + markerMargin
                    ],
                    bottomLeft = [
                        bounds[0][0] - markerMargin,
                        bounds[0][1] - markerMargin
                    ];
                map.setBounds([bottomLeft, topRight], {checkZoomRange: true});
            }, 100);
        collection.events.add('boundschange', fitMarkers);
    }
    return {
        restrict: 'EA',
        scope: {
            center: '=',
            zoom: '='
        },
        compile: function(tElement) {
            var childNodes = tElement.contents();
            tElement.html('');
            return function($scope, element) {
                $script.get('//api-maps.yandex.ru/2.0.30/?load=package.standard,package.clusters&mode=release&lang=ru-RU&ns=ymaps').then(function() {
                    ymaps.ready(function() {
                        $scope.map = new ymaps.Map(element[0], {
                            center   : $scope.center || [0, 0],
                            zoom     : $scope.zoom || 0,
                            behaviors: config.mapBehaviors
                        });
                        $scope.map.controls.add('zoomControl', { right: 5, top: 10 });
                        $scope.markers = new ymaps. GeoObjectCollection({}, config.markerOptions);
                        $scope.map.geoObjects.add($scope.markers);
                        if(config.fitMarkers) {
                            initAutoFit($scope.map, $scope.markers);
                        }
                        element.append(childNodes);
                        $scope.$apply(function() {
                            $compile(childNodes)($scope.$parent);
                        });
                    });
                });
            };
        },
        controller: 'YmapController'
    };
}])
.directive('ymapMarker', function () {
    "use strict";
    return {
        restrict: "EA",
        require : '^yandexMap',
        scope   : {
            coordinates: '=',
            index: '=',
            properties: '='
        },
        link    : function ($scope, elm, attr, mapCtrl) {
            var marker;
            function pickMarker() {
                var coord = [
                    parseInt($scope.coordinates[0], 10),
                    parseInt($scope.coordinates[1], 10)
                ];
                if (marker) {
                    marker.geometry.setCoordinates(coord);
                }
                else {
                    marker = mapCtrl.addMarker(coord, angular.extend({iconContent: $scope.index}, $scope.properties));
                }
            }

            $scope.$watch("index", function (newVal) {
                if (marker) {
                    marker.properties.set('iconContent', newVal);
                }
            });
            $scope.$watch("coordinates", function (newVal) {
                if (newVal) {
                    pickMarker();
                }
            }, true);
            $scope.$on('$destroy', function () {
                if (marker) {
                    mapCtrl.removeMarker(marker);
                }
            });
        }
    };
});