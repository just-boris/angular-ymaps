angular.module('YmapsDemo', ['ymaps']).controller('MapCtrl', function ($scope) {
    function generateMarkers(tlCorner, brCorner, count) {
        var deltaLat = tlCorner[0] - brCorner[0],
            deltaLon = brCorner[1] - tlCorner[1],
            markers = [];
        for(var i = 0; i < count; i++) {
            var lat = brCorner[0] + Math.random()*deltaLat,
                lon = tlCorner[1] + Math.random()*deltaLon;
            markers.push({coordinates: [lat, lon]});
        }
        return markers;
    }
    $scope.removeMarker = function(marker) {
        var index = $scope.markers.indexOf(marker);
        $scope.markers.splice(index, 1)
    };
    $scope.submitMarker = function(lat, lon) {
        if(lat && lon) {
            $scope.markers.push({coordinates: [lat, lon]});
            $scope.addingMarker = false;
        }
    };
    $scope.addMarker = function() {
        $scope.addingMarker = true;
    };
	$scope.map = {
		center:[55.76, 37.64], // Москва
        zoom:10
	};
    $scope.markers = generateMarkers([57.18, 35.55], [52.43, 40.23], 10);
});