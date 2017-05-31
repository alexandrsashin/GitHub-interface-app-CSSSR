(function() {
  'use strict';

  angular
    .module('app', ['ui.router'])
    .config(config);
  
    /* @ngInject */
    function config($stateProvider, $urlRouterProvider) {
      var getUrl = window.location;
      var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

      $stateProvider
        .state('main', {
          url: '/main',
          views: {
            'header': {
              templateUrl: baseUrl + '/js/components/header/headerTmpl.html'
            },
            'content': {
              templateUrl: baseUrl + '/js/components/main/mainTmpl.html',
              controller: 'MainCtrl',
              controllerAs: '$ctrl'       
            }
          } 
        })
        .state('add-info', {
          url: '/add-info/issue/:index',
          views: {
            'header': {
              templateUrl: baseUrl + '/js/components/header/headerTmpl.html'
            },
            'content': {
              templateUrl: baseUrl + '/js/components/add-info/addInfoTmpl.html',
              controller: 'AddInfoCtrl',
              controllerAs: '$ctrl'         
            }
          }  
        })
  
      $urlRouterProvider.otherwise('/main');
    }
})();