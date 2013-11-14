angular.module('MyApp', ['ymaps']).config(function(ymapsConfig) {
    //нужно сменить preset у карты на специальный текстовый
    ymapsConfig.markerOptions.preset = 'twirl#darkgreenStretchyIcon';
})
.controller('MapCtrl', function($scope) {
    //создаем массив с данными для меток
    $scope.markers = [
        {coordinates:[54.46, 38.31], title: 'Пункт А'},
        {coordinates:[53.57, 37.13], title: 'Пункт Б'},
        {coordinates:[53.14, 37.59], title: 'Запасной пункт Б'}
    ];
    //настройки положения карты
    $scope.map = {
        center: [53.57, 37.13], zoom: 12
    };
});