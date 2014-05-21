app.factory('Admin', function($ressource) {
  // fixed ID, because we want to have only 1 config object
  // TODO : any better way to handle that?
  return $ressource('/admin/config/save', { id: '1'});
});
