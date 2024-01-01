/*
 title: Geocoding of french addresses,
 description: A script that converts your addresses from France to GPS coordinates
 author: Benjamin Hatton (https://github.com/basteks/seatable-french-geocoding)
*/
//// Script configuration ////
// Table name
const tableStr = "Table1";
// View Name
const viewStr = "Default View";
// Identifier column name : a field used to identify your record
const identifierStr = "Name";
// Address column name
const addressStr = "Address";
// Latitude column name (must be a number-type column !)
const latStr = "Lat";
// Longitude column name (must be a number-type column !)
const lonStr = "Lon"
// Score minimum limit value : the value to estimate the quality of geocoding (0.6 by default)
const scoreMinLimit = 0.6;
// Save score : do you want to save the geocoding score ?
const saveScore = false;
// Score column name
const scoreStr = "";

//// Script run ////
const table = base.getTableByName(tableStr);
if (table) {
	const view = base.getViewByName(table, viewStr);
	const identifier = base.getColumnByName(table, identifierStr);
	const address = base.getColumnByName(table, addressStr);
	const lat = base.getColumnByName(table, latStr);
	const lon = base.getColumnByName(table, lonStr);
	var score = undefined
    var scoreTest = true;
	if (saveScore) {
		score = base.getColumnByName(table, scoreStr);
        scoreTest = typeof(score)!="undefined";
	}
	if (view && identifier && address && lat && lon && scoreTest) {

		var progress = 25;
		const progressBar=['◔','◑','◕','⚫'];
		var underLimitScores=[];

		function timeout(ms) {
			   return new Promise(resolve => setTimeout(resolve, ms));
		}

		async function nextBlock(queryResult, startIdx) {
		  var i=startIdx
		  for (i; i<Math.min(queryResult.length,startIdx+40);i++) {
			  let record = queryResult[i];
			  var percent = i/(queryResult.length-1)*100;
			  if (percent>=progress) {
			    output.text("Progression : "+progressBar[(progress/25)-1]+" "+progress+"%");
				progress += 25;
			  }
              let missing = typeof(record[lat.name])=="undefined" || typeof(record[lon.name])=="undefined"
			  if (record[address.name]!="" && missing){
				  var zipFound = false;
				  var zipCode = record[address.name].match(/\d{5}/);
				  if (zipCode.length ==1 && zipCode[0].length == 5 && !isNaN(Number(zipCode[0]))) {
					  zipCode = zipCode[0];
					  zipFound = true;
				  }
				  if (zipFound) {
					var request = "https://api-adresse.data.gouv.fr/search/?q="+encodeURI(record[address.name].trim().replaceAll(' ','+'))+"&postcode="+zipCode+"&autocomplete=0&limit=1";
					var data = await fetch(request)
						.then(response => response.json())
						.catch(err => console.error(err));
				  }
				  if(!zipFound || zipFound && data.features.length==0) {
					  request = "https://api-adresse.data.gouv.fr/search/?q="+encodeURI(record[address.name].trim().replaceAll(' ','+'))+"&autocomplete=0&limit=1";
					  data = await fetch(request)
						.then(response => response.json())
						.catch(err => console.error(err));
				  }
				  if (data.features[0].properties.score<scoreMinLimit) {
					underLimitScores.push({identifier: record[identifier.name].trim(), address: record[address.name].trim(), score: Math.round(data.features[0].properties.score*100)/100, lat: data.features[0].geometry.coordinates[1], lon: data.features[0].geometry.coordinates[0], checkLink : "https://www.openstreetmap.org/?mlat="+data.features[0].geometry.coordinates[1]+"&mlon="+data.features[0].geometry.coordinates[0]+"#map=13/"+data.features[0].geometry.coordinates[1]+"/"+data.features[0].geometry.coordinates[0]});
				  }
				  if (saveScore) {
					  base.modifyRow(table, record, {[lat.name]: Number(data.features[0].geometry.coordinates[1]),[lon.name]: Number(data.features[0].geometry.coordinates[0]),[score.name]: Math.round(data.features[0].properties.score*100)/100});
				   }
				  else {
					  base.modifyRow(table, record, {[lat.name]: Number(data.features[0].geometry.coordinates[1]),[lon.name]: Number(data.features[0].geometry.coordinates[0])});
				  }
			  }
		  }
		  if (i<queryResult.length-1) {
			  await timeout(1500);
			  await nextBlock(queryResult, i); 
		  }
		};
        let dataTypeError = false;
		if (lat.type != 'number' || lon.type != 'number') {
			if (lat.type != 'number') { 
              output.markdown("**⚠ The column "+lat.name+" is not of _number_ type! Please modify it or choose another number type column**");
              dataTypeError = true;
            }
			if (lon.type != 'number') {
              output.markdown("**⚠ The column "+lon.name+" is not of _number_ type! Please modify it or choose another number type column**");
              dataTypeError = true;
            }
		}
        if (saveScore) {
            if (score.type != 'number' || score.data.format != 'percent') { 
              output.markdown("**⚠ The column "+score.name+" is not of _percent_ type! Please modify it or choose another number type column**");
              dataTypeError = true;
            }
        }
		if (!dataTypeError) {
			let queryResult = base.getRows(table, view);
			output.text("There are "+queryResult.length.toString() + " items in the view");
			output.text("Please wait while the adresses are being geocoded...");

			await nextBlock(queryResult, 0);

			output.markdown("**Geocoding achieved !** Please keep in mind that geocoding is not an exact science, please verify your data.")
			if (underLimitScores.length>0) {
				output.markdown("⚠ Pay particular attention to the following items' geocoding :")
				for (let m=0;m<underLimitScores.length;m++) {
					output.markdown("**"+underLimitScores[m]["identifier"]+"**");
                    output.markdown("Address: "+underLimitScores[m]["address"]);
                    output.markdown("Latitude: "+ underLimitScores[m]["lat"]+" - Longitude: "+underLimitScores[m]["lon"]+" - score: "+underLimitScores[m]["score"]);
					output.markdown("[Check link]("+underLimitScores[m]["checkLink"]+")")
				}
			}
			output.markdown("_Script successfully completed_");
		}
	}
    else {
       if(!view) { output.markdown("⚠ Can't find the view! Please check view's name"); } 
       if(!identifier) { output.markdown("⚠ Can't find then identifier column! Please check the name"); } 
       if(!address) { output.markdown("⚠ Can't find the address column! Please check the name"); } 
       if(!lat) { output.markdown("⚠ Can't find the latitude column! Please check the name"); } 
       if(!lon) { output.markdown("⚠ Can't find the longitude column! Please check the name"); } 
       if(saveScore && !scoreTest) { output.markdown("⚠ Can't find the score column! Please check the name"); } 
    }
} else { output.markdown("⚠ Can't find table! Please check table's name"); }
