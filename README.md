# Seatable geocoding
A [Seatable script](https://developer.seatable.io/scripts/) that allows you to geocode your **french** addresses (the API onyly recognizes addresses from France, see Credits bellow).

## Usage
- the content of the address_geocoding.js  should be copied in a [new JavaScript script](https://seatable.io/en/docs/javascript-python/anlegen-und-loeschen-eines-skriptes/), in your Seatable table.

Then, you will have to set the following information in the upper `//// Script configuration ////` part of the script :
- *Table* : the table containing the addresses to geocode
- *View* : the appropriate view (you can for example create a filtered view ensuring that the address column is not empty)
- *Identifier* : a column allowig to identify a specific row
- *Address* : the column containing the addresses you want to geocode
- *Latitude* : the latitude column (must be a **number type** column)
- *Longitude* : the longitude column (must be a **number type** column)
- *Score minimum limit value (reliability percent of the geocoding)* : a value (between 0 and 1) below which the geocoding will be considered potentially problematic (by default I use 0.6)
- *Save score* : a boolean (`true`/`false`) to decide if you want to store this geocoding score for each row
- *Score* : if you actually want to store the score, the column (of **number/percent type**) used  for this data

## Credits
This script uses the french [Address API](https://adresse.data.gouv.fr/api-doc/adresse). Please keep in mind that use of this API is subject to a limit of 50 calls/sec/IP. The script is designed not to exceed this limit.
