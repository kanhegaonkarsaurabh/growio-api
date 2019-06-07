import reqPromise from 'request-promise';
import cheerio from 'cheerio';
import mongoose from 'mongoose';
import colors from 'colors';

const PlantOfTheWeek = mongoose.model('PlantOfTheWeek');

export const getPlantImage = plantCode => {
  const pageUrl = 'https://plants.sc.egov.usda.gov';
  const options = {
    uri: `${pageUrl}/core/profile?symbol=${plantCode}`,
    transform: function(body) {
      return cheerio.load(body);
    },
  };

  return reqPromise(options).then($ => {
    let imageUrl = '';
    let image = $('div[id="mainPic"]')
      .find('img')
      .attr('src');

    if (typeof image == 'undefined' || typeof image == 'null') {
      return null;
    }

    imageUrl = `${pageUrl}${image}`;

    console.log(`SUCCESS: Successfully retrieved image url for plant code ${plantCode} `.green, {imageUrl});

    return imageUrl;

  })

}

export const getPlantOfTheWeek = () => {
  const pageUrl = 'https://plants.sc.egov.usda.gov';
  const options = {
    uri: `${pageUrl}/java/`,
    transform: function(body) {
      return cheerio.load(body);
    },
  };

  return reqPromise(options).then($ => {
    let imageUrl = '';
    let image = $('p:contains("Plant of the Week")')
      .next()
      .find('img')
      .attr('src');
    imageUrl = `${pageUrl}${image}`;

    let commonName = '';
    commonName = $('p:contains("Plant of the Week")')
      .next()
      .find('p')
      .children()
      .first()
      .text(); // .attr('align', 'center').children().find('span').text();

    let sciName = '';
    let sciNameParser = $('p:contains("Plant of the Week")')
      .next()
      .find('em')
      .each(function(i, el) {
        // search for <em></em> tags after the section.
        if ($(this).text().length > 0) {
          sciName = sciName + $(this).text() + ' ';
        }
      });

    console.log(`SUCCESS: Successfully parsed plant of the week for week ${new Date()}`.green, {
      imageUrl,
      commonName,
      sciName,
    });

    /*
        Best case: Return {imageUrl: String, commonName: String, sciName: String}
        Worst case: Return {imageUrl: '', commonName: '', sciName: ''}
      */
    return {
      imageUrl,
      commonName,
      sciName,
    };
  });
};

export const setupPlantForTheWeek = () => {
  console.log(`LOG: Cron job running at ${new Date()}`);
  // scrape and get the plant details
  getPlantOfTheWeek()
    .then(async plant => {
      // Clear the existing PlantOfTheWeek collection completely
      try {
        await Promise.all([PlantOfTheWeek.deleteMany({})]);
      } catch (err) {
        console.log('ERROR: Could not reset the PlantOfTheWeek collection'.red, err);
      }

      // Add the new plant of the day to the database
      try {
        const newPlant = await new PlantOfTheWeek({
          imageUrl: plant.imageUrl,
          commonName: plant.commonName,
          sciName: plant.sciName,
        }).save();
      } catch (err) {
        console.log('ERROR: Could not store scraped plant to PlantOfTheWeek collection'.red, err);
      }
    })
    .catch(err => {
      console.log('ERROR: Plant of the week cron job failed. Error in promise', err);
    });
};
