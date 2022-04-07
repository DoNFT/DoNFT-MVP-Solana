import axios, { AxiosResponse } from 'axios';
import { MetadataJson } from './../types';

export const lookup = async (url: string): Promise<MetadataJson> => {
  try {
    const { data } = await axios.get<string, AxiosResponse<MetadataJson>>(url);
    console.log(data, 'lookup data')
    return data;
  } catch {
    throw new Error(`unable to get metadata json from url ${url}`);
  }
};
