import reqPromise from 'request-promise';
import cheerio from 'cheerio';

const url = 'https://plants.sc.egov.usda.gov/java/';

const getPlantOfTheWeek = () => {
  return reqPromise(url);
};
