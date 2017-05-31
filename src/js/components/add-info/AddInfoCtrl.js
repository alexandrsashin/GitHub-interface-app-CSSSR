(function(){
  
  'use strict'
  
  angular
    .module('app')
    .controller('AddInfoCtrl', AddInfoCtrl);
    
    /* @ngInject */
    function AddInfoCtrl($stateParams, pageService) {
      var self = this;

      // Load default object of the app
	    self.appData = pageService.useAppData();	

      self.index = $stateParams.index;
    }
})();