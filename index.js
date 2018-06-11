var cheerio = require('cheerio');
var http = require('http');
var iconv = require('iconv-lite');
let fs = require("fs");
var path = require("path");
// var url = 'http://www.mmonly.cc/tag/cs/';
var url = 'http://www.mmonly.cc/tag/cs/3.html';
let Ut = require("./common");

    async function asyncFunc(dir,index,url,cb){
        try {
            let opts = {
                url: url,
            };
            let path = "./images/"+dir+'/'+index+".jpg";
            let r1 = await Ut.downImg(opts, path,cb);
            console.log(r1);
        }
        catch (e) {
            console.log(e);
        }
    }

    function linkList() {
        http.get(url, function(sres) {
            let chunks = [];
            sres.on('data', function(chunk) {
                chunks.push(chunk);
            });
            // chunks里面存储着网页的 html 内容，将它zhuan ma传给 cheerio.load 之后
            // 就可以得到一个实现了 jQuery 接口的变量，将它命名为 `$`
            // 剩下就都是 jQuery 的内容了
            sres.on('end', function() {
                let linkList = [];
                //由于咱们发现此网页的编码格式为gb2312，所以需要对其进行转码，否则乱码
                //依据：“<meta http-equiv="Content-Type" content="text/html; charset=gb2312">”
                let html = iconv.decode(Buffer.concat(chunks), 'gb2312');
                let $ = cheerio.load(html, {decodeEntities: false});
                $('.infinite_scroll .ABox a').each(function (idx, element) {
                    let $element = $(element);
                    let _url = $element.attr("href");
                    linkList.push({
                        href: _url
                    });
                    let _path  = "image"+idx; //文件目录
                    getTotal(_url,(total)=>{
                        let _total = parseInt(total);
                        if(_total){
                            mkdirs(_path,()=>{
                                console.log("_total",_total);
                                getDetailsImgList(_path,1,_total,_url.replace(".html",""));
                            });
                        }
                    });
                });
                // console.log(linkList);
            });
        });
    }

    function getTotal(link,cb) {
        http.get(link, function(sres) {
            let chunks = [];
            sres.on('data', function(chunk) {
                chunks.push(chunk);
            });
            sres.on('end', function() {
                let html = iconv.decode(Buffer.concat(chunks), 'gb2312');
                let $ = cheerio.load(html, {decodeEntities: false});
                let text = $('.pages ul li').eq(0).find("a").text();
                var Total = text.replace(/[^0-9]/ig,"");
                cb(Total);
            });
        });
    }

    /**
     *
     * @param dir  保存图片的目录
     * @param index  图片idnex ,用于生成图片名字
     * @param total
     * @param link   用于抓取的页面链接
     */
    function getDetailsImgList(dir,index,total,link) {
        let _newLink = index===1? link+'.html': link+"_"+index+".html";
        http.get(_newLink, function(sres) {
            let chunks = [];
            sres.on('data', function(chunk) {
                chunks.push(chunk);
            });
            sres.on('end', function() {
                let imgList = [];
                let html = iconv.decode(Buffer.concat(chunks), 'gb2312');
                let $ = cheerio.load(html, {decodeEntities: false});
                $('.big-pic img').each(function (idx, element) {
                    let $element = $(element);
                    let _url = $element.attr("src");
                    imgList.push({
                        src: _url
                    });

                    asyncFunc(dir,index,_url,()=>{
                        if(index!==total){
                            getDetailsImgList(dir,++index,total,link);
                        }
                    });
                });
                // console.log(imgList);
            });
        });
    }

    function mkdirs(dirname, callback) {
        try{
            fs.accessSync('./images/'+dirname,fs.F_OK);
        }catch(e){
            fs.mkdir("./images/"+dirname, callback);
            console.log('在' + path.dirname(dirname) + '目录创建好' + dirname  +'目录');
            return false;
        }
        callback();
        return true;
    }
    linkList();

