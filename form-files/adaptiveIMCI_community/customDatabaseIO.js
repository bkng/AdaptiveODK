define(
function(){
	var question_order = [
"initial_visit",
"drink", "vomit", "convulsions", "cough", "diarrhea", "measles", "fever", 
"indraw_stridor_wheezing", "diarrhea_blood",
"diarrhea_lethargic", "diarrhea_restless", "diarrhea_drink_properly", "diarrhea_thirsty",
"diarrhea_pinch", "diarrhea_sunken_eyes", "malaria_risk", "fever_persistent",
"measles_before", "measles_stiffneck", "measles_signs", "measles_ulcers", "measles_eyedischarge",
"measles_eyeclouding", "ear_problem", "ear_pain", "ear_tender", "ear_discharge",
"malnut_wasting", "malnut_oedema", "malnut_lowweight", "anemia_pallor", "pallor_severity"];
	
	var text_response_questions = ["breath_rate","cough_days","diarrhea_days","fever_days",
"patient_age","patient_name","patient_weight"];

	var metadata = ["instanceId","instanceName","tableId"];

	var DELIMITER = "`"; //NOTE if this delimiter is changed it must change in the escapeString and unescapeString functions 
	var NULL_CHARACTER = "@";

//TODO what to do with these? "Immediate_Action_List", "followUp"
	

	
	//WARNING: the tilda escaping will not work in all cases, it is just a quick fix
	function escapeString(string){
		return string.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/`/g,"\\~");
	}	

	function unescapeString(string){
		return string.replace(/\\~/g,"`").replace(/\\"/g,"\"").replace(/\\\\/g,"\\");
	}

	function compressDatabase(jsonobj){
		var data = [];
		//add the questions
		var dataString = "";
		for(var i = 0; i < question_order.length ; i++){
			var key = question_order[i];
			if (jsonobj.answers[key] == 'no')
				dataString += "0";
			else if(jsonobj.answers[key] == 'yes')
				dataString += "1";
			else 
				dataString += "2"; //this should only be for null values 
		}

		for(var i = 0; i < text_response_questions.length ; i++){
			var answer = jsonobj.answers[text_response_questions[i]];
			dataString +=  DELIMITER + (answer!=null? escapeString(answer.toString()) : NULL_CHARACTER);
		}	
		for(var i = 0; i <metadata.length; i++){
			var answer = jsonobj[metadata[i]];
			dataString +=  DELIMITER + (answer!=null? escapeString(answer.toString()) : NULL_CHARACTER);
		}	
		console.log(dataString);
		return dataString;	
	}

	function decompressDatabase(dbstring){
		var newObj = {};
		newObj["answers"] = {};
		var answers = dbstring.split(DELIMITER);
		for(var i = 0; i < question_order.length; i++){
			switch(answers[0].charAt(i)){
			case '0': newObj.answers[question_order[i]] = 'no'; break;
			case '1': newObj.answers[question_order[i]] = 'yes'; break;
			case '2': newObj.answers[question_order[i]] = null; break;
			}
		}
		for(var i = 0; i < text_response_questions.length ; i++){
			var answer = answers[1 + i]; 
			newObj.answers[text_response_questions[i]] = (answer == NULL_CHARACTER ? null : unescapeString(answer));
		}
		for(var i = 0; i <metadata.length; i++){
			var answer = answers[1 + text_response_questions.length + i];
			newObj[metadata[i]] = (answer == NULL_CHARACTER ? null : unescapeString(answer));
		}
		return newObj;
	}

	return {
		/**
		 * These functions accept a json object and serialize
		 * the object to a string that can be formatted in a qr code
		 **/
		"serializeDatabase" : function(jsonobj){
			return compressDatabase(jsonobj);
		},
		"deserializeDatabase" : function(encoded_string){
			return decompressDatabase(encoded_string);
		}
	};
});

