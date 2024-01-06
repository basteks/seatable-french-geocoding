# SeaTable French geocoding

A [SeaTable script](https://developer.seatable.io/scripts/) that allows you to geocode (convert address to GPS coordinates) your **french** addresses (the API onyly recognizes addresses from France).

## Usage
- the content of the french-geocoding-seatable.js file needs to be copied in a [new JavaScript script](https://seatable.io/en/docs/javascript-python/anlegen-und-loeschen-eines-skriptes/) or [imported](https://seatable.io/en/docs/javascript-python/import-und-export-eines-skriptes/), in your Seatable table.

Then, you will have to set the following information in the upper `//// Script configuration ////` part of the script :
- *Table*: the table containing the addresses to geocode
- *View*: the appropriate view (you can for example create a filtered view ensuring that the address column is not empty)
- *Identifier*: a column allowing to identify a specific row
- *Address*: the column containing the address you want to geocode
- *Latitude*: the column that will store the latitude returned by the geocoding (**number type**)
- *Longitude*: the column that will store the longitude returned by the geocoding (**number type**)
- *Score minimum limit value (reliability percent of the geocoding)*: a value (between 0 and 1) below which the geocoding will be considered potentially problematic (by default I use 0.6)
- *Save score*: do you want to store this geocoding score for each row ?. The options are "yes" or "no"
- *Score*: if you actually want to store the score, the column (of **number/percent type**) used  for this data

## Limitations
Please keep in mind that use of the french [Address API](https://adresse.data.gouv.fr/api-doc/adresse) is subject to a limit of 50 calls/sec/IP. The script is designed not to exceed this limit.

## Credits
This script uses the french [Address API](https://adresse.data.gouv.fr/api-doc/adresse).
