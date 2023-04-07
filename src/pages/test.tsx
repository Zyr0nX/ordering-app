import React, { useState } from 'react';
import en from 'react-phone-number-input/locale/en.json';
import { CountrySelect } from '~/components/common/PhoneNumber';
import PhoneNumberInput from "~/components/common/PhoneNumberInput";


const Test = () => {
    const [country, setCountry] = useState("US");
    const [value, setValue] = useState<string>();
  return (
    <CountrySelect labels={en} value={country} onChange={setCountry}/>
  )
}

export default Test