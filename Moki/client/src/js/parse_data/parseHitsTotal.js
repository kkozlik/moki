/*
return hits total
*/

export default function parseHitsTotal(response) {
  if (response &&
          response.hits &&
          response.hits.total &&
          response.hits.total.value ) {
    return responses.hits.total.value;
  }
  return 0;
}
