angular.module('MyApp', ['ymaps']).controller('MapCtrl', function($scope) {
    //настройки положения карты
    $scope.leftMap = {
        center: [55.74, 37.61], zoom: 12
    };
    $scope.rightMap = {
        center: [59.93, 30.33], zoom: 12
    };
    $scope.updateBinding = function() {
        if($scope.bindMaps) {
            $scope.rightMap = $scope.leftMap;
        } else {
            $scope.rightMap = angular.copy($scope.leftMap);
        }
    };
});
