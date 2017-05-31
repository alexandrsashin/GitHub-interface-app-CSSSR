(function() {
  'use strict';

  angular
    .module('app')
    .service('pageService', pageService);

  /* @ngInject */
  function pageService($http) {
    var vm = this;

    // The main object of app
    vm.appData = {
      currentPage: 1,
      errorUser: false,
      errorRepo: false,
      issueNumber: 3,
      issueArr: '',
      name: '',
      repo: '',
      repoList: [],
      search: '',
      totalPages: ''
    }

    // Getter function that is used by app controllers
    vm.useAppData = () => vm.appData;   
  }
})();