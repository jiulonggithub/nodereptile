let request = require("request");
let fs = require("fs");
let  index = 0;
class Ut {
    /**
     * 下载网络图片
     * @param {object} opts
     * @param {function} cb
     */
    static downImg(opts = {}, path = '',cb) {
        return new Promise((resolve, reject) => {
            request
                .get(opts)
                .on('response', (response) => {
                    // console.log("img type:", response.headers['content-type'])
                })
                .pipe(fs.createWriteStream(path))
                .on("error", (e) => {
                    console.log("pipe error", e);
                    resolve('');
                })
                .on("finish", () => {
                    // console.log("finish");
                    cb();
                    resolve("ok");
                    index++;
                    console.log('第'+index+"张图下载完毕");
                })
                .on("close", () => {
                    // console.log("close");
                })

        })
    };
}

module.exports = Ut;