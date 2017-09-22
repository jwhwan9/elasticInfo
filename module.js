var ESApp = angular.module('ESApp', []);

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
	search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    return target.replace(new RegExp(search, 'g'), replacement);
};

ESApp.filter('bytes', function() {
    return function(bytes, precision) {
        if (bytes === 0) { return '0 bytes' }
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;

        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024)),
            val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

        return  (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) +  ' ' + units[number];
    }
});

ESApp.controller('ESCtrl', function($scope, $http) {
	
	$scope.idxStatus=[];
	$scope.idxFilterStatus=[];
	$scope.ES_Action="";
	
	$scope.init = function(){
		$scope.ES_IP ="172.16.160.61";
		$scope.ES_Parameter="";		
		$scope.ES_Result=[];
		$scope.IndexTotalSize=0;
		$scope.FilterKeyword="";
	};	
	
	$scope.myElastFilter = function(myItems) {
		var result = {};
        angular.forEach(myItems, function(value, key) {
            if ( $scope.FilterKeyword.trim()=="" || key.indexOf($scope.FilterKeyword) !== -1) {
                result[key] = value;
            }
        });
		$scope.idxFilterStatus = result;
		$scope.GetAllStoreByte();
        return result;
	};
	
    $scope.GetES = function() {
		
        // 基本用法
        $http({
            method: 'GET',
            url: 'http://'+$scope.ES_IP+':9200/'+$scope.ES_Parameter,
            params: {
                //name: 'Johnson'
            }
        })
        .success(function(data, status, headers, config) {
            console.log(data);
            console.log(status);
			
			var myResult = JSON.stringify(data);			
			$scope.ES_Result = data;
			$scope.idxStatus = $scope.ES_Result.indices;	
			for(var item in $scope.idxStatus) {
				$scope.idxStatus[item].isChecked= true;
			}
			
			$scope.GetAllStoreByte();
		
			// [,"] -> [,<br>"]
			myResult = myResult.replaceAll(',"',',<br>"');									
			// [\n] -> [<br>]
			myResult = myResult.replace('\\n', '<br />');
						
			document.getElementById("Resp").innerHTML = '<pre>' + myResult + '</pre>';			
        })
        .error(function(data, status, headers, config) {
            // Error
        });
    };
	
	$scope.GetAllStoreByte = function(){
		var myTotal = 0;
		
		for(var item in $scope.idxFilterStatus) {
			if($scope.idxFilterStatus[item].isChecked == true){
				myTotal = myTotal + $scope.idxFilterStatus[item].total.store.size_in_bytes;
			}
		}
		$scope.IndexTotalSize = myTotal;
		
		return myTotal;
	}
	
	$scope.GetJSONKey = function(Param){
		return Object.keys(Param);
	};
	
	
	$scope.GetES_ClusterHealth = function(){
		$scope.ES_Parameter="_cluster/health";
		$scope.GetES();
	};
			
	$scope.GetES_MasterNode = function(){
		$scope.ES_Parameter="_cat/master?v";
		$scope.GetES();
	};
	
	$scope.GetES_ClusterState = function(){
		$scope.ES_Parameter="_cluster/state";
		$scope.GetES();
	};
	
	$scope.GetES_ClusterStatus = function(){
		$scope.ES_Parameter="_stats";
		$scope.GetES();				
		console.log($scope.idxStatus);
	};
	
	$scope.GetES_NodeStatus = function(){
		$scope.ES_Parameter="_nodes/stats";
		$scope.GetES();
	};
	
});