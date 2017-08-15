console.log('Mobile Control Panel Extension Loaded');

// Add 'Mobile' to the left nav
window.OPENSHIFT_CONSTANTS.PROJECT_NAVIGATION.splice(1, 0, {
  label: "Mobile",
  iconClass: "fa fa-mobile",
  href: "/mobile",
  prefixes: ["/mobile/"],
  isValid: function() {
    // TODO: Can this check if any mobile apps exist first?
    return true;
  }
});

// Add 'Mobile' category and sub-categories to the Service Catalog UI
window.OPENSHIFT_CONSTANTS.SERVICE_CATALOG_CATEGORIES.splice(OPENSHIFT_CONSTANTS.SERVICE_CATALOG_CATEGORIES.length, 0, {
  id: 'mobile', label: 'Mobile', subCategories: [
    {id: 'apps', label: 'Apps', tags: ['mobile'], icon: 'fa fa-mobile'},
    {id: 'services', label: 'Services', tags: ['mobile-service'], icon: 'fa fa-database'}
  ]
});

angular
  .module('mobileOverviewExtension', ['openshiftConsole'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/project/:project/mobile', {
        templateUrl: 'extensions/mcp/mobile.html',
        controller: 'MobileOverviewController'
      })
      .when('/project/:project/create-mobileapp', {
        templateUrl: 'extensions/mcp/create-mobileapp.html',
        controller: 'CreateMobileappController'
      })
      .when('/project/:project/browse/mobileapps', {
        templateUrl: 'extensions/mcp/mobileapps.html',
        controller: 'MobileAppsController',
        reloadOnSearch: false
      })
      .when('/project/:project/browse/mobileapps/:mobileapp', {
        templateUrl: 'extensions/mcp/mobileapp.html',
        controller: 'MobileAppController',
        reloadOnSearch: false
      })
    }
  )
  .controller('MobileOverviewController', ['$scope', '$controller', '$routeParams', 'ProjectsService', 'APIService', 'DataService', function ($scope, $controller, $routeParams, ProjectsService, APIService, DataService) {
    // Initialize the super class and extend it.
    angular.extend(this, $controller('OverviewController', {$scope: $scope}));
    console.log('MobileOverviewController');

    // TODO: hook these up to service listing and filtering based on 'mobile' annotations
    $scope.mobileservices = [];
    $scope.nonmobileservices = [];


    ProjectsService
      .get($routeParams.project)
      .then(_.spread(function(project, context) {
        
        $scope.project = project;
        $scope.context = context;
        DataService.list({
            group: 'mobile.k8s.io',
            resource: 'mobileapps'
          }, $scope.context).then(function(resources) {
          $scope.mobileapps = resources.by("metadata.name");
          $scope.emptyMessage = "No " + APIService.kindToResource('MobileApp', true) + " to show";
        });

      }));
   }])
   .controller('MobileAppsController', ['$scope', '$routeParams', 'DataService', 'ProjectsService', '$filter', function($scope, $routeParams, DataService, ProjectsService, $filter) {
      $scope.projectName = $routeParams.project;
      $scope.mobileapp = null;
      $scope.mobileapps = null;
      $scope.alerts = {};
      $scope.renderOptions = $scope.renderOptions || {};
      $scope.renderOptions.hideFilterWidget = true;
      $scope.breadcrumbs = [
        {
          title: "Mobile Apps",
          link: "project/" + $routeParams.project + "/browse/mobileapps"
        },
        {
          title: $routeParams.mobileapp
        }
      ];

      var watches = [];

      var mobileappResolved = function(mobileapp, action) {
        $scope.loaded = true;
        $scope.mobileapp = mobileapp;

        if (action === "DELETED") {
          $scope.alerts["deleted"] = {
            type: "warning",
            message: "This mobile app has been deleted."
          };
        }
      };
      var resource = {
        group: 'mobile.k8s.io',
        resource: 'mobileapps'
      };

      ProjectsService
        .get($routeParams.project)
        .then(_.spread(function(project, context) {
          $scope.project = project;
          $scope.projectContext = context;
          DataService
            .get(resource, $routeParams.mobileapp, context, { errorNotification: false })
            .then(function(mobileapp) {
              mobileappResolved(mobileapp);
              watches.push(DataService.watchObject(resource, $routeParams.mobileapp, context, mobileappResolved));
            }, function(e) {
              $scope.loaded = true;
              $scope.alerts["load"] = {
                type: "error",
                message: "The mobile app details could not be loaded.",
                details: $filter('getErrorDetails')(e)
              };
            }
          );

          watches.push(DataService.watch(resource, context, function(mobileapps) {
            $scope.mobileapps = mobileapps.by("metadata.name");
          }));

          $scope.$on('$destroy', function(){
            DataService.unwatchAll(watches);
          });

     }));
   }])
    .controller('MobileAppController', ['$scope', '$routeParams', 'DataService', 'ProjectsService', '$filter', function ($scope, $routeParams, DataService, ProjectsService, $filter) {
      $scope.projectName = $routeParams.project;
      $scope.mobileapp = null;
      $scope.mobileapps = null;
      $scope.alerts = {};
      $scope.renderOptions = $scope.renderOptions || {};
      $scope.renderOptions.hideFilterWidget = true;
      $scope.breadcrumbs = [
        {
          title: "Mobile Apps",
          link: "project/" + $routeParams.project + "/browse/mobileapps"
        },
        {
          title: $routeParams.mobileapp
        }
      ];
      $scope.syncconfig = '{\n  "TODO":"SOME CONFIG"\n}';


      var resource = {
        group: 'mobile.k8s.io',
        resource: 'mobileapps'
      };

      var watches = [];

      var mobileappResolved = function(mobileapp, action) {
        $scope.loaded = true;
        $scope.mobileapp = mobileapp;

        if (action === "DELETED") {
          $scope.alerts["deleted"] = {
            type: "warning",
            message: "This mobileapp has been deleted."
          };
        }
      };

      ProjectsService
        .get($routeParams.project)
        .then(_.spread(function(project, context) {
          $scope.project = project;
          $scope.projectContext = context;
          DataService
            .get(resource, $routeParams.mobileapp, context, { errorNotification: false })
            .then(function(mobileapp) {
              mobileappResolved(mobileapp);
              watches.push(DataService.watchObject(resource, $routeParams.mobileapp, context, mobileappResolved));
            }, function(e) {
              $scope.loaded = true;
              $scope.alerts["load"] = {
                type: "error",
                message: "The mobile app details could not be loaded.",
                details: $filter('getErrorDetails')(e)
              };
            }
          );

          watches.push(DataService.watch(resource, context, function(mobileapps) {
            $scope.mobileapps = mobileapps.by("metadata.name");
          }));

          $scope.$on('$destroy', function(){
            DataService.unwatchAll(watches);
          });

      }));
    }])
   .controller('CreateMobileappController',
                function($filter,
                        $location,
                        $routeParams,
                        $scope,
                        $window,
                        ApplicationGenerator,
                        AuthorizationService,
                        DataService,
                        Navigate,
                        ProjectsService) {
      $scope.alerts = {};
      $scope.projectName = $routeParams.project;

      $scope.breadcrumbs = [
        {
          title: $scope.projectName,
          link: "project/" + $scope.projectName
        },
        {
          title: "Mobile Apps",
          link: "project/" + $scope.projectName + "/mobile"
        },
        {
          title: "Create Mobile App"
        }
      ];

      ProjectsService
        .get($routeParams.project)
        .then(_.spread(function(project, context) {
          $scope.project = project;
          $scope.context = context;
          $scope.breadcrumbs[0].title = $filter('displayName')(project);

          var resource = {
            group: 'mobile.k8s.io',
            resource: 'mobileapps'
          };

          if (!AuthorizationService.canI(resource, 'create', $routeParams.project)) {
            Navigate.toErrorPage('You do not have authority to create Mobile Apps in project ' + $routeParams.project + '.', 'access_denied');
            return;
          }

          $scope.navigateBack = function() {
            if ($routeParams.then) {
              $location.url($routeParams.then);
              return;
            }

            $window.history.back();
          };
      }));
    })
    .directive("createMobileApp",
              function($filter,
                        AuthorizationService,
                        DataService,
                        NotificationsService) {
      return {
        restrict: 'E',
        scope: {
          clientType: '=',
          namespace: '=',
          onCreate: '&',
          onCancel: '&'
        },
        templateUrl: 'extensions/mcp/directives/create-mobileapp.html',
        link: function($scope) {
          $scope.clientTypes = [{
              label: "Android",
              iconClass: 'android',
              clientType: 'android'
            }, {
              label: "iOS",
              iconClass: 'apple',
              clientType: 'ios'
            }, {
              label: "Cordova",
              iconClass: 'Cordova',
              clientType: 'Cordova'
            }];

          $scope.newMobileapp = {
            clientType: null,
            data: {}
          };

          var constructMobileappObject = function(data, clientType) {
            /*
            {
                "kind": "MobileApp",
                "apiVersion": "mobile.k8s.io/v1alpha1",
                "metadata": {
                    "creationTimestamp": null,
                    "name":"myapp",
                    "annotations": {
                      "mobile.k8s.io/iconClass": "android"
                    }
                },
                "spec": {
                    "clientType": "android"
                }
            }*/
            var mobileapp = {
              apiVersion: "mobile.k8s.io/v1alpha1",
              kind: "MobileApp",
              metadata: {
                name: $scope.newMobileapp.data.mobileappName,
                // TODO: let server set the icon class based on the clientType
                annotations: {
                  "mobile.k8s.io/iconClass": clientType.iconClass
                }
              },
              spec: {
                clientType: clientType.clientType
              }
            };

            return mobileapp;
          };

          var hideErrorNotifications = function() {
            NotificationsService.hideNotification("create-mobileapp-error");
          };

          $scope.nameChanged = function() {
            $scope.nameTaken = false;
          };

          $scope.create = function() {
            hideErrorNotifications();
            var newMobileapp = constructMobileappObject($scope.newMobileapp.data, $scope.newMobileapp.clientType);
            DataService.create('mobileapps', null, newMobileapp, $scope).then(function(mobileapp) { // Success
              NotificationsService.addNotification({
                type: "success",
                message: "Mobile App " + newMobileapp.metadata.name + " was created."
              });
              $scope.onCreate({newMobileapp: mobileapp});
            }, function(result) { // Failure
              var data = result.data || {};
              if (data.reason === 'AlreadyExists') {
                $scope.nameTaken = true;
                return;
              }
              NotificationsService.addNotification({
                id: "create-mobileapp-error",
                type: "error",
                message: "An error occurred while creating the mobile app.",
                details: $filter('getErrorDetails')(result)
              });
            });
          };

          $scope.cancel = function() {
            hideErrorNotifications();
            $scope.onCancel();
          };
        }
      };
    })
   

hawtioPluginLoader.addModule('mobileOverviewExtension');
