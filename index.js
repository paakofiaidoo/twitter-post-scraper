const axios = require("axios");
// @ts-ignore
require("dotenv").config({ path: __dirname + "/.env" });
const ObjectsToCsv = require("objects-to-csv");

let query = ["looking for interns", "apply for internship", "want to become an intern", "hiring intern"];
let url = `https://api.twitter.com/1.1/search/tweets.json`,
    params = {
        q: "",
        result_type: "resent",
        geocode: "51.51753,-0.11214,1000km",
        count: 100,
    },
    headers = {
        // @ts-ignore
        Authorization: `Bearer ${process.env.TOKEN}`,
    };

// @ts-ignore

axios
    .all(
        query.map((q) => {
            params.q = q;
            return axios(url, { params, headers });
        })
    )
    .then((data) => {
        return data.reduce((prev, curr) => {
            return [...(prev.data ? prev.data.statuses : prev), ...curr.data.statuses];
        });
    })
    .then((data) => {
        return removeDuplicatesByID(
            data.map((status) => {
                return {
                    created_at: status.created_at,
                    text: status.text,
                    screen_name: status.user.screen_name,
                    username: status.user.name,
                    userURL: status.user.url,
                    userDescription: status.user.description,
                    tweetURL: status.entities.urls[0] ? status.entities.urls[0].url : "",
                    id: status.id,
                };
            })
        );
    })
    .then((data) => {
        const csv = new ObjectsToCsv(data);
        csv.toDisk(`./twitter.csv`, { append: false });
    })
    .catch((err) => {
        console.log(err);
    });
function removeDuplicatesByID(arr) {
    let unique_array = [];
    for (let i = 0; i < arr.length; i++) {
        if (
            unique_array.findIndex((obj) => {
                return obj.id === arr[i].id || obj.text.split("https://t.co")[0] === arr[i].text.split("https://t.co")[0];
            }) === -1
        ) {
            unique_array.push(arr[i]);
        }
    }
    return unique_array;
}
