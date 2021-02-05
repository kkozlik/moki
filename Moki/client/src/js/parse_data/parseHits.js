/*
return hits 
*/

export default function parseHits(response) {
  if (response &&
          response.hits &&
          response.hits.hits) {
    return responses.hits.hits;
  }
  return [];
}
