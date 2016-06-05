angular.module('thebestdoctorsfriend.controllers', [])

    .controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, AuthFactory, patientFactory) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        // Form data for the login modal
        $scope.loginData = $localStorage.getObject('userinfo', '{}');
        $scope.registration = {};
        $scope.loggedIn = false;

        if (AuthFactory.isAuthenticated()) {
            $scope.loggedIn = true;
            $scope.username = AuthFactory.getUsername();
        }

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            console.log('Doing login', $scope.loginData);
            $localStorage.storeObject('userinfo', $scope.loginData);

            AuthFactory.login($scope.loginData);

            $scope.closeLogin();
        };

        $scope.logOut = function () {
            AuthFactory.logout();
            $scope.loggedIn = false;
            $scope.username = '';
        };

        $rootScope.$on('login:Successful', function () {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
        });


        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/register.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.registerform = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeRegister = function () {
            $scope.registerform.hide();
        };

        // Open the login modal
        $scope.register = function () {
            $scope.registerform.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doRegister = function () {
            console.log('Doing registration', $scope.registration);
            $scope.loginData.username = $scope.registration.username;
            $scope.loginData.password = $scope.registration.password;

            AuthFactory.register($scope.registration);
            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function () {
                $scope.closeRegister();
            }, 1000);
        };

        $rootScope.$on('registration:Successful', function () {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
            $localStorage.storeObject('userinfo', $scope.loginData);
        });

        // Object patients
        $scope.patients = {
            firstName: "",
            lastName: "",
            age: 0,
            gender: "Male",
            phoneNumber: "",
            email: "",
            medicalHistory: "",
            medicalTreatment: "",
            nextAppointment: ""

        };

        // Create the addpatients modal that we will use later
        $ionicModal.fromTemplateUrl('templates/addpatients.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.addPatientsForm = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeAddPatients = function () {
            $scope.addPatientsForm.hide();
        };

        // Open the login modal
        $scope.addPatients = function () {
            $scope.addPatientsForm.show();
        };

        // Perform the savePatient action when the user submits the addPatients form
        $scope.savePatient = function () {

            patientFactory.save($scope.patients);
            console.log($scope.patients);


            $scope.patients = {
                firstName: "",
                lastName: "",
                age: 0,
                gender: "Male",
                phoneNumber: "",
                email: "",
                medicalHistory: "",
                medicalTreatment: "",
                nextAppointment: ""
            };
            $scope.closeAddPatients();
        };
    })

    .controller('PatientsListController', ['$scope', 'patientFactory', function ($scope, patientFactory) {

        $scope.showPatientsList = false;
        $scope.message = "Loading ...";

        patientFactory.query(
            function (response) {
                $scope.patients = response;
                $scope.showPatientsList = true;

            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }])

    .controller('PatientDetailController', ['$scope', '$stateParams', '$state', 'patientFactory', '$ionicPopup', function ($scope, $stateParams, $state, patientFactory, $ionicPopup) {

        $scope.patient = {};
        $scope.showPatient = false;
        $scope.message = "Loading ...";
        $scope.shouldShowDelete = false;

        $scope.patient = patientFactory.get({
            id: $stateParams.id
        })
            .$promise.then(
            function (response) {
                $scope.patient = response;
                $scope.showPatient = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );

        $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log($scope.shouldShowDelete);
        };

        $scope.deletePatient = function (patientId) {

            var confirmPopup = $ionicPopup.confirm({
                title: '<h3>Confirm Delete</h3>',
                template: '<p>Are you sure you want to delete this item?</p>'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    console.log('Ok to delete');
                    patientFactory.delete({ id: patientId });

                    $state.go($state.current, {}, { reload: true });

                } else {
                    console.log('Canceled delete');
                }
            });
            $scope.shouldShowDelete = false;


        };
    }])


    ;
