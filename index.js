const TeleBot = require('telebot');

const fs = require('fs');
const ytdl = require('ytdl-core');
const bot = new TeleBot('YOUR TOKEN HERE');

function sendFile(msg, file){
    msg.reply.file(file)
}

var known_good = [];

bot.on(['/start', '/hello'], (msg) => msg.reply.text('Welcome!'));
bot.on(/^\/add (.+)$/, (msg, props) => {
    if(known_good.includes(msg.from.id)){
        const text = props.match[1];
        known_good = known_good.concat(text);
        console.log("Added known user", known_good);
        msg.reply.text("okay");
    }
});
bot.on(/^\/youtube (.+)$/, (msg, props) => {
    id = msg.from.id;
    if(!known_good.includes(id)){
        msg.reply.text("Please ask the admin to add your id \'"+id+"\' to known users")
        return;
    }
    try {
        const text = props.match[1];
        console.log("Got youtube link: "+text);
        if(!ytdl.validateURL(text)){
            msg.reply.text('Youtube link not valid');
        }
        ytdl.getInfo(text, {filter:"audioonly"}, (err, info) => {
            if (err) throw err;
            msg.reply.text(info);
            console.log(info.title);

            // If file already exists
            if (fs.existsSync(info.title+'.mp3')) {
                console.log("File already exists");
                sendFile(msg, info.title+'.mp3');
                return;
            }

            msg.reply.text('Starting Download...');
            ytdl(text,{filter:"audioonly"})
            .pipe(fs.createWriteStream(info.title+'.mp3'))
            .on('finish', () => {
                sendFile(msg, info.title+'.mp3');
            });
            
            //delete after 24 hours
            setTimeout(fs.unlinkSync, 24*60*60*1000, info.title+'.mp3');
          });
    } catch (e) {
        msg.reply.text('There was an error: '+ e);
    }
});
bot.start();