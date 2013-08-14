angular.module('ymaps', ['script'])
.constant('ymapConfig', {
	fitMarkers: true
})
.controller('YmapController', ['$scope', '$element', function ($scope, $element) {

}])
.directive('yandexMap', ['$compile', '$script', function ($compile, $script) {
	return {
		restrict: 'EA',
		scope: {
			center: '=',
			zoom: '='
		},
		compile: function(tElement, tAttrs) {
			var childNodes = tElement.contents();
            tElement.html('');
            return function($scope, element) {
        		$script.get('//api-maps.yandex.ru/2.0.30/?load=package.standard,package.clusters&mode=release&lang=ru-RU&ns=ymaps').then(function() {
					ymaps.ready(function() {
						$scope.map = new ymaps.Map(element[0], {
			                center   : $scope.center || [0, 0],
			                zoom     : $scope.zoom || 0,
			                behaviors: ['default', 'scrollZoom']
			            });
			        });
			        element.append(childNodes);
                    $compile(childNodes)($scope.$parent);
				});
            }    
		},
		controller: 'YmapController'
	}
}]);