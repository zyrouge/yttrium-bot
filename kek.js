const axios = require("axios").default;
const fs = require("fs");
const { PassThrough } = require("stream");

const start = async () => {
    const url =
        "https://cdn.discordapp.com/attachments/721733789428219974/840885755554562048/Acejax_feat._Danilyon_-_By_My_Side_NCS_Release_non_bass.mp3";

    const res = await axios.get(url, {
        responseType: "stream",
    });
    const stream = res.data;
    const copy = new PassThrough();
    stream.on("data", (data) => {
        console.log("data!");
        copy.write(data);
    });
    // copy.write();

    // stream.on("data", (data) => {
    //     console.log(`Data! ${data.length}`);
    // });

    const write1 = fs.createWriteStream("./kekw1.mp3");
    copy.pipe(write1);

    setTimeout(() => {
        write1.destroy();

        const write2 = fs.createWriteStream("./kekw2.mp3");
        stream.pipe(write2);

        // stream.unpipe(write1);
        // write1.end();
        console.log("keked----------------------------------");
    }, 50);

    ["finish", "end", "close"].forEach((x) => {
        stream.on(x, () => console.log(x + "ed"));
    });
};

start();
