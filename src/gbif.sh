# works
curl -X 'GET' \
  'https://api.gbif.org/v1/occurrence/search?country=CH&q=rosa&limit=3&offset=0' \
  -H 'accept: application/json'

# works
curl -X 'GET' \
  'https://api.gbif.org/v1/species/suggest?q=pulsatilla%20vulgaris' \
  -H 'accept: application/json'

# does not work
curl -X 'GET' \
  'https://api.gbif.org/v1/species/suggest?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&q=pulsatilla' \
  -H 'accept: application/json' 

# does not work
# https://discourse.gbif.org/t/species-search-by-datasetkey-not-working/4263
curl -X 'GET' \
  'https://api.gbif.org/v1/species/suggest?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13' \
  -H 'accept: application/json' 

https://api.gbif.org/v1/species/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13
https://api.gbif.org/v1/species/search?datasetKey=2d59e5db-57ad-41ff-97d6-11f5fb264527

# does not work
curl -X 'GET' \
  'https://api.gbif.org/v1/species/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&q=veronica&limit=3' \
  -H 'accept: application/json'


# does not work
curl -X 'GET' \
  'https://api.gbif.org/v1/species/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&limit=3' \
  -H 'accept: application/json'

# does work but results make no sense
curl -X 'GET' \
  'https://api.gbif.org/v1/species/search?datasetID=INFOFLORA-TRAC&limit=3' \
  -H 'accept: application/json'

# does work but results make no sense
curl -X 'GET' \
  'https://api.gbif.org/v1/species/search?datasetName=Swiss%National%Databank%of%Vascular%Plants&limit=3' \
  -H 'accept: application/json'

# works without datasetKey
curl -X 'GET' \
  'https://api.gbif.org/v1/species/search?q=pulsatilla&limit=3' \
  -H 'accept: application/json'


# works: search from SISF https://www.gbif.org/dataset/83fdfd3d-3a25-4705-9fbe-3db1d1892b13
curl -X 'GET' \
  'https://api.gbif.org/v1/occurrence/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&limit=3&offset=0' \
  -H 'accept: application/json'
  
curl -X 'GET' \
  'https://api.gbif.org/v1/occurrence/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&scientificName=pulsatilla%vulgaris&limit=3&offset=0' \
  -H 'accept: application/json'

# search by species key
curl -X 'GET' \
  'https://api.gbif.org/v1/occurrence/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&speciesKey=3172062&limit=3&offset=0' \
  -H 'accept: application/json'

# works: search by taxonID (url-encode the taxonID: infospecies.ch:infoflora:59100)
curl -X 'GET' \
  'https://api.gbif.org/v1/occurrence/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&taxonID=infospecies.ch%3Ainfoflora%3A59100&limit=3&offset=0' \
  -H 'accept: application/json'
# BUT: how to get a list of speciesKeys for a dataset?

curl -X 'GET' \
  'https://api.gbif.org/v1/occurrence/search?speciesKey=3172062&&limit=3&offset=0' \
  -H 'accept: application/json'

  # species download from the occurrence dataset: GBIF.org (24 January 2024) GBIF Occurrence Download  https://doi.org/10.15468/dl.ctsxky
  # https://discourse.gbif.org/t/species-search-by-datasetkey-not-working/4263/2