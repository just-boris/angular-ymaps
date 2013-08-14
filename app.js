angular.module('YmapsDemo', ['ymaps']).controller('MapCtrl', function ($scope) {
	$scope.map = {
		center:[55.76, 37.64], // Москва
        zoom:10
	}
});