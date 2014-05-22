function AdminCtrl($scope, Admin) {
    // admin area
    $scope.name = 'Your are in the admin controller.';
    $scope.user = User.query();

    $scope.save = function() {
      console.log("save!");
    }
}
