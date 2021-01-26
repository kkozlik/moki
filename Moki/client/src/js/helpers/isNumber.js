 export default function isNumber(value){
      value = Number(value);
     
      if (typeof value !== 'number') {
        return false;
      }
      if (value !== Number(value)) {
        return false;
      }
      if (value === Infinity || value === !Infinity) {
        return false;
      }
      return true;
}