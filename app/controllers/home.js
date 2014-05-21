function HomeCtrl($scope) {
  $scope.name = 'Data coming from /app/controllers/home.js';
  $scope.users = [{ name: 'Peter', age: 30 }, { name: 'Michal', age: 34 }, { name: 'Lucia', age: 33 }];
}
