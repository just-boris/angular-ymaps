/*global angular*/
angular.module('ymaps', []);
angular.module('ymaps').factory('$script', ['$q', '$rootScope', function ($q, $rootScope) {
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
            if (angular.isFunction(callback)) {
                callback();
            }
        };
        el.async = true;
        el.src = path;
        document.getElementsByTagName('body')[0].appendChild(el);
    }

    var loadHistory = [], //кэш загруженных файлов
        pendingPromises = {}; //обещания на текущие загруки
    return function (url) {
        var deferred = $q.defer();
        if (loadHistory.indexOf(url) !== -1) {
            deferred.resolve();
        }
        else if (pendingPromises[url]) {
            return pendingPromises[url];
        } else {
            loadScript(url, function () {
                delete pendingPromises[url];
                loadHistory.push(url);
                //обязательно использовать `$apply`, чтобы сообщить
                //angular о том, что что-то произошло
                $rootScope.$apply(function () {
                    deferred.resolve();
                });
            });
            pendingPromises[url] = deferred.promise;
        }
        return deferred.promise;
    };
}]);
angular.module('ymaps').directive('mapPreloader', ['$script', 'ymapsConfig', '$window', function ($script, ymapsConfig, $window) {
        // Return directive configuration.
        // NOTE: ngSwitchWhen priority is 500.
        // NOTE: ngInclude priority is 0.
        return({
            restrict: 'EA',
            priority: 250,
            transclude: 'element',
            link: function link($scope, element, attributes, controller, transcludeFn) {

                // When we are preloading the data, we'll put
                // a loading indicator in the DOM. I probably
                // wouldn't do this in production (in this
                // fashion), but for the demo, it will be nice
                // to see the feedback.
                var loadingElement = $("<div>Загружаем карты...</div>")
                        .css({
                            color: "#CCCCCC",
                            fontStyle: "italic"
                        });

                // Once the element is transcluded, we'll have
                // to keep track of it so we can remove it
                // later (when destroyed).
                // --
                // NOTE: This is NOT the same element that the
                // ngSwitch will have reference to.
                var injectedElement = null;

                // Show the "loading..." element.
                element.after(loadingElement);

                // Keep track of whether or not the $scope has
                // been destroyed while the data was loading.
                var isDestroyed = false;

                // Preload the "remote" data.
                $script(ymapsConfig.apiUrl).then(
                    function () {
                        $window.ymaps.ready(
                            function () {
                                // if the scope / UI has been destoyed,
                                // the ignore the processing.
                                if (isDestroyed) return;

                                // Once the given data has been
                                // preloaded, we can transclude and
                                // inject our DOM node.
                                transcludeFn($scope, function(copy) {
                                    loadingElement.remove();
                                    element.after(injectedElement = copy);
                                });
                                $scope.$apply();
                            }
                        );

                    }
                );

                // When the scope is destroyed, we have to be
                // very careful to clean up after ourselves.
                // Since the injected element we have a handle
                // on is DIFFERENT than the element that the
                // ngSwitch has a handle on, the ngSwitch-based
                // destroy will leave our injected element in
                // the DOM.
                $scope.$on("$destroy", function () {
                        isDestroyed = true;
                        loadingElement.remove();
                        // Wrap in $() in case it's still null.
                        $(injectedElement).remove();
                    }
                );
            }
        });

    }]
);

angular.module('ymaps').constant('ymapsConfig', {
    apiUrl: '//api-maps.yandex.ru/2.1/?load=package.standard,package.clusters&mode=release&lang=ru-RU&ns=ymaps',
    mapBehaviors: ['default'],
    markerOptions: {
        preset: 'islands#darkgreenIcon'
    },
    fitMarkers: true
});
angular.module('ymaps').value('debounce', function (func, wait) {
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
});
angular.module('ymaps').directive('yandexMap', ['$compile', '$window', 'debounce', '$timeout', function ($compile, $window, debounce, $timeout) {
    "use strict";
    return {
        restrict: 'EA',
        priority: 1,
        transclude: true,
        replace: false,
        template: "<div class=\"angular-ymaps\"><div ng-transclude style=\"display: none\"></div></div>",
        scope: {
            center: '=',
            zoom: '=',
            config: '=?'
        },
        controller: ['$scope', '$element', 'ymapsConfig', '$window', function ($scope, $element, ymapsConfig, $window) {
            "use strict";

            $scope.config = angular.extend(ymapsConfig, $scope.config);
            $scope.ymaps = $window.ymaps;
            $scope.updateBounds = false;

            this.fitMarkers = function () {
                //brought from underscore http://underscorejs.org/#debounce
                if (($scope.markers.getLength() > 0) && $scope.config.fitMarkers) {
                    debounce(function () {
                        var markerMargin = 0.1;
                        var bounds = $scope.markers.getBounds(),
                        //make some margins from
                            topRight = [
                                    bounds[1][0] + markerMargin,
                                    bounds[1][1] + markerMargin
                            ],
                            bottomLeft = [
                                    bounds[0][0] - markerMargin,
                                    bounds[0][1] - markerMargin
                            ];
                        $scope.map.setBounds([bottomLeft, topRight], {checkZoomRange: true, zoomMargin: 10});
                    }, 100)();
                }
            };

            this.addMarker = function (coordinates, properties, options) {
                var placeMark = new $scope.ymaps.Placemark(coordinates, properties, options);
                $scope.markers.add(placeMark);

                return placeMark;
            };

            this.removeMarker = function (marker) {
                $scope.markers.remove(marker);
            };
        }],
        link: function ($scope, elm, attr, ctrl) {
            $scope.map = new $scope.ymaps.Map(elm[0], {
                center: $scope.center || [0,0],
                zoom: $scope.zoom || 0,
                behaviors: $scope.config.mapBehaviors
            });

            $scope.markers = new $scope.ymaps.GeoObjectCollection({}, $scope.config.markerOptions);

            $scope.map.geoObjects.add($scope.markers);

            if ($scope.config.fitMarkers) {
                $scope.markers.events.add('boundschange', ctrl.fitMarkers);
            }

            $scope.$watch('center', function (newVal) {
                if (!$scope.updatingBounds) {
                    $scope.map.panTo(newVal);
                }
            }, true);

            $scope.$watch('zoom', function (zoom) {
                if (!$scope.updatingBounds) {
                    $scope.map.setZoom(zoom, {checkZoomRange: true});
                }
            });

            $scope.map.events.add('boundschange', function (event) {
                //noinspection JSUnusedAssignment
                if ($scope.updatingBounds || angular.isUndefined($scope.center) || angular.isUndefined($scope.zoom)) return;
                $timeout(function() {
                    $scope.updatingBounds = true;
                    $scope.$apply(function () {
                        $scope.center = event.get('newCenter');
                        $scope.zoom = event.get('newZoom');
                    });
                    $scope.updatingBounds = false;
                });
            });

            $scope.$on("$destroy", function () {
                $scope.map.destroy();
            });
        }
    };
}]);
angular.module('ymaps').directive('ymapMarker', function () {
    "use strict";
    return {
        restrict: "EA",
        require: '^yandexMap',
        scope: {
            coordinates: '=',
            index: '=',
            properties: '=',
            options: '='
        },
        link: function ($scope, elm, attr, mapsCtrl) {
            var marker;

            function pickMarker() {
                var coord = [
                    parseFloat($scope.coordinates[0]),
                    parseFloat($scope.coordinates[1])
                ];
                if (marker) {
                    marker.geometry.setCoordinates(coord);
                } else {
                    marker = mapsCtrl.addMarker(coord, angular.extend({iconContent: $scope.index}, $scope.properties), $scope.options);
                    marker.events.add('dragend', function (obj) {
                        $scope.$apply(function () {
                            $scope.coordinates = obj.originalEvent.target.geometry.getCoordinates();
                        });
                    });
                }
            }

            $scope.$watch("index", function (newVal) {
                if (marker) {
                    marker.properties.set('iconContent', newVal);
                }
            });

            $scope.$watch("coordinates", function (newVal, oldVal) {
                if (newVal) {
                    pickMarker();
                }
            }, true);

            $scope.$on('$destroy', function () {
                if (marker) {
                    mapsCtrl.removeMarker(marker);
                }
            });
        }
    };
});
