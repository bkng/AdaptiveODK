define(['promptTypes','jquery','underscore', 'formulaFunctions', 'prompts'],
function(promptTypes, $, _, formulaFunctions) {
    //TODO code copied from builder.js take out the not relevant things
    function formula(content) {
        var result = '(function(context){\n'+
            'return ('+ content + ');\n' +
            '})';
        try {
            var parsedFunction = formulaFunctions.evaluator(result);
            return function(context){
                try {
                    return parsedFunction.call(this, context);
                } catch (e) {
                    console.error("builder.formula: " + result + " exception: " + String(e));
                    alert("Could not call formula.\nSee console for details.");
                    throw new Error("Exception in user formula.");
                    // controller.fatalError();
                }
            };
        } catch (e) {
            console.error("builder.formula: " + result + " exception evaluating formula: " + String(e));
            alert("Could not evaluate formula: " + result + '\nSee console for details.');
            throw new Error("Could not evaluate formula: " + result + '\nSee console for details.');
            // return function(){};
        }
    }
		return {
			"menu" : promptTypes.base.extend({	
				type: "menu",
				datatype: "menu",
				autoAdvance: true,
				templatePath: "../test/menu.handlebars",
        formulaFunctions : formulaFunctions,
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
				},
				postActivate: function(ctxt){
					//		TODO -> problem with this is that this.form.queries
					//		is not se by builder.js for this prompt*/
					//promptTypes.select.prototype.postActivate(ctxt);
					this.renderContext.title = this.display_title();
					var that = this;
					var newctxt = $.extend({}, ctxt, {success: function(outcome) {
					ctxt.append("prompts." + that.type + ".postActivate." + outcome,
								"px: " + that.promptIdx);
				//	that.updateRenderValue(that.parseSaveValue(that.getValue()));
					ctxt.success();
				}});
						that.renderContext.passiveError = null;
						if(that.param in that.form.queries) {
								//TODO this never happens
								populateChoicesViaQuery(that.form.queries[that.param], newctxt);
						} else if (that.param in that.form.choices) {
								//Very important.
								//We need to clone the choices so their values are unique to the prompt.
                var calculates = that.formulaFunctions;
                var processValue = function(text){
                  if (!($.type(text) == "string"))
                    return text;
                  if(text.length < 3)
                   text; 
                  if (text.substring(0,2) == "{{" && text.substring(text.length - 2, text.length) == "}}"){
                    return formula(text.substring(2,text.length -2))(); 
                 }
                  return text;
                }
								that.renderContext.choices = _.map(that.form.choices[that.param], _.clone);
                //now loop through every field in the object and apply the processValue function
                //alert(processValue("{{calculates.get_patient_name()}}"));
                for(var key in that.renderContext.choices){
                  for(var field in that.renderContext.choices[key]){
                    that.renderContext.choices[key][field] = processValue(that.renderContext.choices[key][field]); 
                  }
                }
								newctxt.success("choiceList.success");
						} else {
							newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
						}
				}
			})
		};
});