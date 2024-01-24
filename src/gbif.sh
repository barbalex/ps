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
curl -X 'GET' \
  'https://api.gbif.org/v1/species/suggest?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13' \
  -H 'accept: application/json' 

# does not work
curl -X 'GET' \
  'https://api.gbif.org/v1/species/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&q=veronica&limit=3' \
  -H 'accept: application/json'

# does not work
curl -X 'GET' \
  'https://api.gbif.org/v1/species/search?datasetKey=83fdfd3d-3a25-4705-9fbe-3db1d1892b13&limit=3' \
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

curl -X 'GET' \
  'https://api.gbif.org/v1/occurrence/search?speciesKey=3172062&&limit=3&offset=0' \
  -H 'accept: application/json'