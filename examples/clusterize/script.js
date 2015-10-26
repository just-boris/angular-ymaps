angular.module('MyApp', ['ymaps']).config(function(ymapsConfig) {
    //включим кластеризацию
    ymapsConfig.clusterize = true;
}).controller('MapCtrl', function($scope) {
    // маркеры для кластера
    $scope.markers = [
        [54.46, 38.31],
        [54.57, 38.13],
        [54.50, 38.59]
    ];
    //настройки положения карты
    $scope.map = {
        center: [54.57, 38.31], zoom: 7
    };
});
