const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

let queue = [];
let player = createAudioPlayer();
let currentConnection = null;

player.on(AudioPlayerStatus.Idle, (oldState) => {
    if(queue.length > 0) {
        playNextInQueue();
    }
});

function playNextInQueue() {
    if(queue.length > 0) {
        const url = queue.shift();
        const stream = ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 });
        const resource = createAudioResource(stream);
        player.play(resource);
    }
}

client.on('messageCreate', async message => {
    if(message.author.bot) return;

    if(message.content.startsWith('!play ')) {
        const url = message.content.split(' ')[1];
        queue.push(url);

        const channel = message.member.voice.channel;

        if(channel) {
            console.log('Joining voice channel:', channel.name);

            currentConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            currentConnection.subscribe(player);
            playNextInQueue();
        } else {
            message.reply('You need to join a voice channel first!');
        }
    } else if(message.content === '!pause') {
        player.pause();
    } else if(message.content === '!resume') {
        player.unpause();
    }
});


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login('MTE1MTUyNTM2MzM5NTA3MjA4Mw.GY2PSe.ZJnUiES0OFt-rghxUh4e7yDci_bF2mlJaLa3Zs');
