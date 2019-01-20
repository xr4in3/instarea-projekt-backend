const axios = require("axios");
const fs = require("fs");
const client_id = process.env.client_id
const client_secret = process.env.client_secret

//helper function to clean up data
const reject = (obj, keys) => {
  return Object.keys(obj)
    .filter(k => !keys.includes(k))
    .map(k => Object.assign({}, { [k]: obj[k] }))
    .reduce((res, o) => Object.assign(res, o), {});
};
// number of ms to delay between requests
const RATE_DELAY = 1000;

// wrap setTimeout into a promise so we can use async/await
async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
//fetch different types of venues, get ids
let id = [];
let data = [];
let promise1 = axios
  .get(
    `https://api.foursquare.com/v2/venues/explore?client_id=${client_id}&client_secret=${client_secret}&v=20190114&ll=48.1576,17.1628&section=food`
  )
  .then(response => data.push(response.data.response.groups[0].items));
let promise2 = axios
  .get(
    `https://api.foursquare.com/v2/venues/explore?client_id=${client_id}&client_secret=${client_secret}&v=20190114&ll=48.1576,17.1628&section=shops`
  )
  .then(response => data.push(response.data.response.groups[0].items));
let promise3 = axios
  .get(
    `https://api.foursquare.com/v2/venues/explore?client_id=${client_id}&client_secret=${client_secret}&v=20190114&ll=48.1576,17.1628&section=arts`
  )
  .then(response => data.push(response.data.response.groups[0].items));
let promise4 = axios
  .get(
    `https://api.foursquare.com/v2/venues/explore?client_id=${client_id}&client_secret=${client_secret}&v=20190114&ll=48.1576,17.1628&section=outdoors`
  )
  .then(response => data.push(response.data.response.groups[0].items));
let promise5 = axios
  .get(
    `https://api.foursquare.com/v2/venues/explore?client_id=${client_id}&client_secret=${client_secret}&v=20190114&ll=48.1576,17.1628&section=sights`
  )
  .then(response => data.push(response.data.response.groups[0].items));

Promise.all([promise1, promise2, promise3, promise4, promise5])
  .then(
    res =>
      (id = Array.from(new Set([].concat(...data).map(item => item.venue.id))))
  )
  .then(() => {
    fs.writeFile("id.json", JSON.stringify(id, null, 4), error => {
      if (error) {
        console.log(error);
      } else {
        console.log("success");
        // get details for each venue
        let idArray = require("./id.json");

        let allUrls = [];
        let newData = [];
        for (let elem of idArray) {
          let url = `https://api.foursquare.com/v2/venues/${elem}?client_id=${client_id}&client_secret=${client_secret}&v=20190114`;

          allUrls.push(url);
        }

        // loop over uris and fetch each, waiting between.
        async function doRequests(allUrls) {
          for (const uri of allUrls) {
            //cleanup
            await axios.get(uri).then(result => {
              newData.push(
                reject(result.data.response.venue, [
                  "venueRatingBlacklisted",
                  "venuePage",
                  "canonicalUrl",
                  "verified",
                  "stats",
                  "dislike",
                  "ok",
                  "beenHere",
                  "hereNow",
                  "page",
                  "ratingColor",
                  "ratingSignals",
                  "specials",
                  "photos",
                  "tips",
                  "reasons",
                  "shortUrl",
                  "timeZone",
                  "popular",
                  "listed",
                  "pageInbox",
                  "attributes",
                  "bestPhoto",
                  "inbox",
                  "colors",
                  "pageUpdates",
                  "allowMenuUrlEdit",
                  "createdAt",
                  "parent",
                  "hierarchy",
                  "likes.groups",
                  "likes.summary",
                  "hours.richStatus",
                  "hours.dayData"
                ])
              );
              console.log(result.data.response.venue);
            });
            await wait(RATE_DELAY);
          }
        }
        doRequests(allUrls)
          .then(() => console.log("done"))
          .then(() =>
            fs.writeFile(
              "import.json",
              JSON.stringify(newData, null, 4),
              err => {
                if (err) {
                  console.log("err:", err);
                } else {
                  console.log("saved");
                  //final cleanup - relevant data only

                  let imported = require("./import.json");
                  let clean = [];
                  for (let elem of Array.from(new Set(imported))) {
                    let isOpen = null;
                    let price = -1;
                    if (elem.hours && elem.hours.isOpen) {
                      isOpen = elem.hours.isOpen;
                    }
                    if (elem.price && elem.price.tier) {
                      price = elem.price.tier;
                    }
                    let payload = {
                      name: elem.name,
                      location: elem.location,
                      contact: elem.contact.formattedPhone,
                      cat: elem.categories[0].name,                      
                      likes: elem.likes.count,
                      rating: elem.rating,
                      description: elem.description,
                      url: elem.url,
                      isOpen: isOpen,
                      hours: elem.hours,
                      price: price,
                      icon: elem.categories[0].icon,
                      visible: false,
                    };
                    clean.push(payload);
                  }

                  fs.writeFile(
                    "dbimport.json",
                    JSON.stringify(clean, null, 4),
                    err => {
                      if (err) {
                        console.log(err, "error");
                      } else {
                        console.log("done");
                      }
                    }
                  );

                  // let catSet = [];

                  // //category set
                  // for (let elem of clean) {
                  //   catSet.push(elem.cat);
                  // }

                  // catSet = Array.from(new Set(catSet));

                  // fs.writeFile(
                  //   "categorySet.json",
                  //   JSON.stringify(catSet, null, 4),
                  //   err => {
                  //     if (err) {
                  //       console.log(err);
                  //     } else {
                  //       console.log("done");
                  //     }
                  //   }
                  // );
                }
              }
            )
          );
      }
    });
  });
