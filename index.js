const axios = require("axios");
// @ts-ignore
require("dotenv").config({ path: __dirname + "/.env" });
const ObjectsToCsv = require("objects-to-csv");

let url = `https://api.twitter.com/1.1/search/tweets.json`,
    params = {
        q: "looking for interns",
        result_type: "resent",
        geocode: "51.51753,-0.11214,1000km",
        count: 100,
    },
    headers = {
        // @ts-ignore
        Authorization: `Bearer ${process.env.TOKEN}`,
    };

// @ts-ignore
axios(url, { params, headers })
    .then(({ data }) => {
        console.log(data.search_metadata);
        return data.statuses.map((status) => {
            return {
                created_at: status.created_at,
                text: status.text,
                screen_name: status.user.screen_name,
                username: status.user.name,
                userURL: status.user.url,
                userDescription: status.user.description,
                tweetURL: status.entities.urls[0].url,
            };
        });
    })
    .then((data) => {
        const csv = new ObjectsToCsv(data);
        csv.toDisk(`./twitter.csv`, { append: false });
    })
    .catch((err) => {
        console.log(err);
    });
