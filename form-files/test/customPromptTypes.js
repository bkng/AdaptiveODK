define(['promptTypes','jquery','underscore', 'prompts'],
function(promptTypes, $,       _) {
    return {
			"bryantest" : promptTypes.select.extend({	
				type: "bryantest",
				datatype: "bryantest",
				autoAdvance: true,
				templatePath: "../test/bryantest.handlebars",
				events: {
					"click .menu-button" : "clicked"	
				},
				clicked: function(evt){
					//TODO a quick hack, make this more robust
					var ctxt = controller.newContext(evt);
					controller.gotoNextScreen(ctxt);
				},
			})
		};
});
