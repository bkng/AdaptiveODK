define(['promptTypes','jquery','underscore', 'formulaFunctions', 'prompts'],
function(promptTypes, $, _, formulaFunctions) {
    return {
			"menu" : promptTypes.base.extend({	
				type: "menu",
				datatype: "menu",
				autoAdvance: true,
				templatePath: "../test/menu.handlebars",
				events: {
					"click .menu-button" : "clicked"	
				},
				clicked: function(evt){
					//TODO a quick hack, make this more robust
					var ctxt = controller.newContext(evt);
					controller.gotoNextScreen(ctxt);
				},
				afterInitialize: function(ctxt){
					this.renderContext.test = "TESTTEST";
          this.renderContext.testtest = this.testtest;
          this.renderContext.title= this.display_title();
				},
				postActivate: function(ctxt){
					//		TODO -> problem with this is that this.form.queries
					//		is not se by builder.js for this prompt*/
					//promptTypes.select.prototype.postActivate(ctxt);
					
					var that = this;
					var newctxt = $.extend({}, ctxt, {success: function(outcome) {
					ctxt.append("prompts." + that.type + ".postActivate." + outcome,
								"px: " + that.promptIdx);
				//	that.updateRenderValue(that.parseSaveValue(that.getValue()));
					ctxt.success();
				}});
						var populateChoicesViaQuery = function(query, newctxt){
								var queryUri = query.uri();
								if(queryUri.search('//') < 0){
										//If the uri is not a content provider or web resource,
										//assume the path  is relative to the form directory.
										queryUri = opendatakit.getCurrentFormPath() + queryUri;
								}
								
								var ajaxOptions = {
										"type": 'GET',
										"url": queryUri,
										"dataType": 'json',
										"data": {},
										"success": function(result){
												that.renderContext.choices = query.callback(result);
												newctxt.success("success");
										},
										"error": function(e) {
												newctxt.append("prompts." + this.type + ".postActivate.error", 
										"px: " + this.promptIdx + " Error fetching choices");
												//This is a passive error because there could just be a problem
												//with the content provider/network/remote service rather than with
												//the form.
												console.log(e);
												that.renderContext.passiveError = "Error fetching choices.\n";
												if(e.statusText) {
														that.renderContext.passiveError += e.statusText;
												}
							newctxt.failure({message: "Error fetching choices via ajax."});
										}
								};
								var queryUriExt = queryUri.split('.').pop();
								if(queryUriExt === 'csv') {
										ajaxOptions.dataType = 'text';
										ajaxOptions.success = function(result) {
												requirejs(['jquery-csv'], function(){
														that.renderContext.choices = query.callback($.csv.toObjects(result));
														newctxt.success("success");
												},
							function (err) {
								newctxt.append("promptType.select.requirejs.failure", err.toString());
								newctxt.failure({message: "Error fetching choices from csv data."});
							});
										};
								}
								$.ajax(ajaxOptions);
				};
				
						that.renderContext.passiveError = null;
						if(that.param in that.form.queries) {
								populateChoicesViaQuery(that.form.queries[that.param], newctxt);
						} else if (that.param in that.form.choices) {
								//Very important.
								//We need to clone the choices so their values are unique to the prompt.
								that.renderContext.choices = _.map(that.form.choices[that.param], _.clone);
								newctxt.success("choiceList.success");
						} else {
							newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
						}
				}
			})
		};
});
