/**
 * Module dependencies.
 */

var restify = require('restify'),
    Slack = require('node-slack'),
    slack = new Slack('{{domain}}', '{{token}}'), //domain是在Slack所用的domain name，{domain}.slack.com, token可以到Incoming WebHooks中查詢
    jsdom = require("jsdom"),
    moment = require('moment');

var port = Number(process.env.PORT || 3000); 
var site = '{{site url}}'; //欲查詢alexa排名的網址，不含http://
var botName = '{{botName}}'; //顯示在Slack的bot name
var handlePath = '{{path}}' //需和Outgoing Web Hooks中URL的path的部份一致,ex: "/askalexa"

var server = restify.createServer({
	  name: 'ask-alexa-robot',
    version: '0.0.1'
});


server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post(handlePath, function(req, res, next) {
    jsdom.env({
        url: "http://www.alexa.com/siteinfo/"+site,
        scripts: ["http://code.jquery.com/jquery.js"],
        done: function(errors, window) {
            var $ = window.$;
            rank = $(".countryRank .metrics-data.align-vmiddle").text();
            var date = moment().format("MM/D");
            var result = ' 你好, 今天(' + date + ')Alexa排名是:' + rank;
            var reply = slack.respond(req.params, function(hook) {
                return {
                    text: hook.user_name + result,
                    username: botName 
                };
            });
            res.json(reply);
		        return next();
        }
    });
});

server.listen(port, function () {
	  console.log('%s listening at %s', server.name, server.url);
});


