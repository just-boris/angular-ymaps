/*global angular*/
angular.module('ymaps', [])
.factory('$script', ['$q', '$rootScope', function ($q, $rootScope) {
    "use strict";
    //классический кроссбраузерный способ подключить внешний скрипт
    function loadScript(path, callback) {
        var el = document.createElement("script");
        el.onload = el.onreadystatechange = function () {
            if (el.readyState && el.readyState !== "complete" &&
                el.readyState !== "loaded") {
                return;
            }
            // если все загрузилось, то снимаем обработчик и выбрасываем callback
            el.onload = el.onreadystatechange = null;
            if(angular.isFunction(callback)) {
                callback();
            }
        };
        el.async = true;
        el.src = path;
        document.getElementsByTagName('body')[0].appendChild(el);
    }
    var loadHistory = [], //кэш загруженных файлов
        pendingPromises = {}; //обещания на текущие загруки
    return function(url) {
        var deferred = $q.defer();
        if(loadHistory.indexOf(url) !== -1) {
            deferred.resolve();
        }
        else if(pendingPromises[url]) {
            return pendingPromises[url];
        } else {
            loadScript(url, function() {
                delete pendingPromises[url];
                loadHistory.push(url);
                //обязательно использовать `$apply`, чтобы сообщить
                //angular о том, что что-то произошло
                $rootScope.$apply(function() {
                    deferred.resolve();
                });
            });
            pendingPromises[url] = deferred.promise;
        }
        return deferred.promise;
    };
}])
.factory('ymapsLoader', ['$window', '$timeout', '$script', 'ymapsConfig', function($window, $timeout, $script, ymapsConfig) {
    "use strict";
    var scriptPromise;
    return {
        ready: function(callback) {
            if(!scriptPromise) {
                scriptPromise = $script(ymapsConfig.apiUrl).then(function() {
                    return $window.ymaps;
                });
            }
            scriptPromise.then(function(ymaps) {
                ymaps.ready(function() {
                    $timeout(function() {callback(ymaps);});
                });
            });
        }
    };
}])
.constant('ymapsConfig', {
    apiUrl: '//api-maps.yandex.ru/2.1/?load=package.standard,package.clusters&mode=release&lang=ru-RU&ns=ymaps',
    mapBehaviors: ['default'],
    markerOptions: {
        preset: 'islands#darkgreenIcon'
    },
    clusterOptions: {
      preset: 'islands#darkGreenClusterIcons'
    },
    fitMarkers: true,
    fitMarkersZoomMargin: 40,
    clusterize: false
})
//brought from underscore http://underscorejs.org/#debounce
.value('debounce', function (func, wait) {
    "use strict";
    var timeout = null;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
})
.controller('YmapController', ['$scope', '$element', 'ymapsLoader', 'ymapsConfig', 'debounce', function ($scope, $element, ymapsLoader, config, debounce) {
    "use strict";
    function initAutoFit(map, collection, ymaps) {
        collection.events.add('boundschange', debounce(function () {
            if(collection.getLength() > 0) {
                var maxZoomBefore = map.options.get('maxZoom');
                map.options.set('maxZoom', $scope.zoom);
                map.setBounds(collection.getBounds(), {
                    checkZoomRange: true,
                    zoomMargin: config.fitMarkersZoomMargin
                }).then(function () {
                  map.options.set('maxZoom', maxZoomBefore);
                  //we need to manually update zoom, because of http://clubs.ya.ru/mapsapi/replies.xml?item_no=59735
                  map.setZoom(map.getZoom());
                });
            }
        }, 100));
    }
    var self = this;
    ymapsLoader.ready(function(ymaps) {
        self.addMarker = function(coordinates, properties, options) {
            var placeMark = new ymaps.Placemark(coordinates, properties, options);
            $scope.markers.add(placeMark);

            return placeMark;
        };
        self.removeMarker = function (marker) {
            $scope.markers.remove(marker);
        };
        self.map = new ymaps.Map($element[0], {
            center   : $scope.center || [0, 0],
            zoom     : $scope.zoom || 0,
            behaviors: config.mapBehaviors
        });
        var collection = new ymaps.GeoObjectCollection({}, config.markerOptions);
        if(config.clusterize) {
          $scope.markers = new ymaps.Clusterer(config.clusterOptions);
          collection.add($scope.markers);
        } else {
          $scope.markers = collection;
        }
        self.map.geoObjects.add(collection);
        if(config.fitMarkers) {
            initAutoFit(self.map, collection, ymaps);
        }
        var updatingBounds, moving;
       $scope.$watch('center', function(newVal) {
            if(updatingBounds) {
                return;
            }
            moving = true;
            self.map.panTo(newVal).always(function() {
                moving = false;
            });
        }, true);
        $scope.$watch('zoom', function(zoom) {
            if(updatingBounds) {
               return;
            }
            self.map.setZoom(zoom, {checkZoomRange: true});
        });
        self.map.events.add('boundschange', function(event) {
            if(moving) {
                return;
            }
            //noinspection JSUnusedAssignment
            updatingBounds = true;
            $scope.$apply(function() {
                $scope.center = event.get('newCenter');
                $scope.zoom = event.get('newZoom');
            });
            updatingBounds = false;
        });

    });
}])
.directive('yandexMap', ['ymapsLoader', function (ymapsLoader) {
    "use strict";
    return {
        restrict: 'EA',
        terminal: true,
        transclude: true,
        scope: {
            center: '=',
            zoom: '='
        },
        link: function($scope, element, attrs, ctrl, transcludeFn) {
            ymapsLoader.ready(function() {
                transcludeFn(function( copy ) {
                    element.append(copy);
                });
            });
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
            properties: '=',
            options: '='
        },
        link: function ($scope, elm, attr, mapCtrl) {
            var marker;
            function pickMarker() {
                var coord = [
                    parseFloat($scope.coordinates[0]),
                    parseFloat($scope.coordinates[1])
                ];
                if (marker) {
                    mapCtrl.removeMarker(marker);
                }
                marker = mapCtrl.addMarker(coord, angular.extend({iconContent: $scope.index}, $scope.properties), $scope.options);
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
