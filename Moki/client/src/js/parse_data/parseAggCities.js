/*
return avg_count of the aggregations
*/

export default function parseAggCities(response) {
  if (response &&
          response.aggregations &&
          response.aggregations.cities &&
          response.aggregations.cities.buckets) {
    return response.aggregations.cities.buckets;
  }
  return 0;
}
