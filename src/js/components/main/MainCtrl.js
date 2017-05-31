(function(){
  
  'use strict'
  
  angular
    .module('app')
    .controller('MainCtrl', MainCtrl);
    
    /* @ngInject */
    function MainCtrl($http, $element, pageService) {
      var self = this;

      // use this hack, because ng-keydown, ng-keypress don't work in IE11+
      $($element).find('.search__input').on('keyup', bspClick)

      // Loading indicator
      self.loading = false;

      // Load default object of the app
      self.appData = pageService.useAppData();

      // Filter function for the main search input 
      self.searchFilter = function(item) {
        var str = self.appData.search.toLowerCase()
                                     .slice(self.appData.name.length, self.appData.search.length)
                                     .trim();
        if (self.appData.name.length > self.appData.search.length) {
          return false;
        } else {          
          return item.toLowerCase().indexOf(str) === 0;
        }
      };

      // Function that detects backpaces during input process
      function bspClick(event) {
        if (self.appData.search.split(' ')[0].length > 0 && event.keyCode === 32) {
          self.appData.errorUser = false;
          self.appData.errorRepo = false;
          self.appData.issueArr = '';     
          self.appData.name = self.appData.search.split(' ')[0];    
          self.appData.repo = '';
          self.appData.repoList = [];     
          self.loading = true;       
          
          $http
            .get('https://api.github.com/users/' + self.appData.name + '/repos')
            .then(function(response) {
              self.loading = false;
              self.appData.repoList = response.data.map((elem) => (elem.name));
            },
            function(response) {
              self.appData.errorUser = true;
              self.loading = false;
            });
        } else if (self.appData.search.split(' ')[0].length === 0) {
          self.appData.errorUser = false;
          self.appData.errorRepo = false;
          self.appData.name = '';          
          self.appData.repo = '';
          self.appData.repoList = [];
        }
      };

      // Get issues list after repositories list loading
      self.getIssues = function(prop, value) {
        if (prop === 'repo') {
          if (self.appData.errorUser) {
            self.appData.repo = value;            
            self.appData.search = self.appData.name + ' ' + value;
            self.appData.errorRepo = true;
            return;
          }
          self.loading = true;
          self.appData.search = self.appData.name + ' ' + value;
          self.appData.repo = value;
          self.loadedIssuesData(value);
        } else if (prop === 'search') {
          var repo = value.split(' ')[1];
          if (self.appData.errorUser) {
            self.appData.repo = repo;
            self.appData.errorRepo = true;
            return;
          }
          self.loading = true;
          self.appData.repo = repo;
          self.loadedIssuesData(repo);
        }
      }

      // Loading issues array
      self.loadedIssuesData = function(repo) {

        // Hack for mobile devices
        if (!self.appData.name) {
          self.appData.name = self.appData.search.split(' ')[0]; 
        } 

        $http
          .get('https://api.github.com/repos/' + self.appData.name + '/' + repo + '/issues')
          .then(function(response) {
            if (response.data.length === 0) {
              self.loading = false;
              return [];
            }

            self.appData.issueArr = response.data.map((elem) => ({
              title: elem.title,
              id: elem.id,
              number: elem.number,
              state: elem.state,
              created_at: elem.created_at,
              updated_at: elem.updated_at,
              comments: elem.comments,
              user: {
                login: elem.user.login,
                avatar_url: elem.user.avatar_url,
                html_url: elem.user.html_url
              }
            }));
            self.loading = false;
            return self.appData.issueArr;
          },
          function(response) {
            self.appData.errorRepo = true;
            self.appData.issueArr = ''; 
            self.loading = false;
          });
      } 

      // Sort element of issues array in dependency from current page number
      self.showIssues = function() {
        var issueNumber = Number(self.appData.issueNumber),
            currentPage = '',
            startIndex = '',
            lastIndex = '',
            showArr = [];

        if ((self.appData.currentPage - 1) * issueNumber > self.appData.issueArr.length) {
          self.appData.currentPage = 1;
        }

        currentPage = self.appData.currentPage;
        startIndex = (currentPage - 1) * issueNumber;

        if (startIndex + issueNumber > self.appData.issueArr.length) {
          lastIndex = self.appData.issueArr.length;
        } else {
          lastIndex = startIndex + issueNumber;
        }

        for (var i = startIndex; i < lastIndex; i++) {
          showArr.push(self.appData.issueArr[i]);
        }

        return showArr;
      }

      // Get index of issue (need for state "add-info")
      self.getIssueIndex = function(index) {
        return Number(self.appData.issueNumber) * (self.appData.currentPage - 1) + Number(index);
      }

      // Get amount of pages
      self.getPagination = function() {
        self.appData.totalPages = Math.ceil(self.appData.issueArr.length / self.appData.issueNumber);
        return _.range(0, self.appData.totalPages);
      }
    }
})();