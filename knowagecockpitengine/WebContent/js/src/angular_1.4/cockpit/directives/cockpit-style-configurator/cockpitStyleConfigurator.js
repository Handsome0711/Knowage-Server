/*
Knowage, Open Source Business Intelligence suite
Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.

Knowage is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

Knowage is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @authors Giovanni Luca Ulivo (GiovanniLuca.Ulivo@eng.it)
 * v0.0.1
 * 
 */
(function() {
angular.module('cockpitModule').directive('cockpitStyleConfigurator',function($compile){
	   return{
		   templateUrl: baseScriptPath+ '/directives/cockpit-style-configurator/templates/cockpitStyleConfigurator.html',
		   controller: cockpitStyleConfiguratorControllerFunction,
		   transclude: true,
		   scope: true,

		   	compile: function (tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, element, attrs, ctrl, transclud) {
                    },
                    post: function postLink(scope, element, attrs, ctrl, transclud) {
                    	 
                    	scope.ngModel = scope.$parent.$eval(attrs.ngModel);
                    	
                    	if(scope.ngModel==undefined){
                    		scope.$parent.$eval(attrs.ngModel+"={}");
                    		scope.ngModel = scope.$parent.$eval(attrs.ngModel);
//                    		scope.ngModel={};
                    	} 
                    	
                    	if(attrs.widget!=undefined){
                    		scope.isWidget=true;
                    		scope.initModel();
                    	}else{
                    		scope.isWidget=false;
                    	}
                    	
                    	scope.borderColorOptions.disabled=!scope.ngModel.borders;
                    
                    	 transclude(scope, function (clone, scope) {
                             angular.element(element[0].querySelector("md-content")).prepend(clone);
                         });
                    
                    }
                };
		   	}
	   }
});

angular.module('cockpitModule').directive('cockpitStyleCustomWidgetConfigurator',function($compile){
	   return{
		   templateUrl: baseScriptPath+ '/directives/cockpit-style-configurator/templates/cockpitStyleCustomWidgetConfigurator.html',
		   transclude: true,
		   replace: true,
		   controller: function(){},
		   controllerAs : "cscwc_controller",
		   scope: true,
		   compile: function (tElement, tAttrs, transclude) {
             return {
                 pre: function preLink(scope, element, attrs,ctrl, transclud) {
                 },
                 post: function postLink(scope, element, attrs,ctrl, transclud) {
                	 
                	ctrl.labelWidget = scope.$parent.$eval(attrs.label);
                	ctrl.layoutType = attrs.layout;
                	 if(ctrl.layoutType==undefined){
                		 ctrl.layoutType="row";
                	 }
                	 transclude(scope, function (clone, scope) {
                         angular.element(element[0].querySelector("md-card>md-card-content")).append(clone);
                     });
                 }
             };
		   	}
	   }
});

function cockpitStyleConfiguratorControllerFunction($scope,sbiModule_translate,cockpitModule_template,cockpitModule_generalOptions){
	$scope.translate=sbiModule_translate;
	$scope.cockpitModule_generalOptions=cockpitModule_generalOptions;
	$scope.angular=angular;
	$scope.cockpitStyle={};
	angular.copy(cockpitModule_template.configuration.style,$scope.cockpitStyle);
	
	$scope.initModel=function(){
		angular.copy(angular.merge({},$scope.cockpitStyle,$scope.ngModel),$scope.ngModel)
	}
	
	
	$scope.resetBordersStyle=function(){
		$scope.ngModel.borders=$scope.cockpitStyle.borders
		angular.copy($scope.cockpitStyle.border,$scope.ngModel.border);
	}
	$scope.resetTitlesStyle=function(){
		$scope.ngModel.titles=$scope.cockpitStyle.titles;
		$scope.ngModel.headerHeight=0;
		angular.copy($scope.cockpitStyle.title,$scope.ngModel.title);
	}
	$scope.resetShadowsStyle=function(){
		$scope.ngModel.shadows=$scope.cockpitStyle.shadows;
		angular.copy($scope.cockpitStyle.shadow,$scope.ngModel.shadow);
	}
	
	$scope.borderColorOptions={format:'rgb',disabled:false};
	
	$scope.toggleBorderVisibility=function(){
		$scope.borderColorOptions.disabled=!$scope.ngModel.borders
	}
	$scope.bordersSize=[
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.borders.solid"),
		                    	value:'solid',
		                    	exampleClass:"borderExampleSolid"
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.borders.dashed"),
		                    	value:'dashed',
		                    	exampleClass:"borderExampleDashed"
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.borders.dotted"),
		                    	value:'dotted',
		                    	exampleClass:"borderExampleDotted"
		                    }
	                    ];
	$scope.bordersWidth=[
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.small"),
		                    	value:"0.1em"
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.medium"),
		                    	value:"0.3em"
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.large"),
		                    	value:"0.7em"
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.extralarge"),
		                    	value:"1em"
		                    },
	                    ];

	$scope.boxShadow=[
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.small"),
		                    	value:'0px 1px 1px #ccc'
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.medium"),
		                    	value:'0px 2px 3px #ccc'
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.large"),
		                    	value:'0px 4px 5px #ccc'
		                    },
		                    {
		                    	label:sbiModule_translate.load("sbi.cockpit.style.extralarge"),
		                    	value:'0px 8px 19px #ccc'
		                    },
	                    ];
 
}


})();