import Owner from '../owner.ts';
import houseType from './houseType.ts';


type house = {
  owner: Owner;
  type: houseType;
}

export default house;