const {Client, MessageEmbed} = require("discord.js");
const config = require("./config.json");

clientLog('start bot service');

const client = new Client();

client.on("ready", function(){
    clientLog(`the client becomes ready to start`);
    clientLog(`I am ready! Logged in as ${client.user.tag}!`);
});

client.on("guildMemberUpdate", function(oldMember, newMember){
    clientLog(`a guild member updated`);
    handleWelcomeRoleAdd(oldMember, newMember);
});

client.on("userUpdate", function(oldMember, newMember){
    clientLog(`a user updated`);
    handleWelcomeRoleAdd(oldMember, newMember);
});

client.on("presenceUpdate", function(oldMember, newMember){
    clientLog('a precense updated');
    handleWelcomeRoleAdd(oldMember, newMember);
});

client.login(config.bot_token);

function clientLog(message, data) {
    if (!data) {
        console.log(message);
    } else {
        console.log(message, data);
    }
}

function handleWelcomeRoleAdd(oldMember, newMember) {
    let newRoles = getNewRoles(oldMember, newMember);
    if (!newRoles || !newRoles.length) {
        return null;
    }

    newRoles.map(function(roleName){
        if (roleName == config.welcome_role) {
            postWelcomeMessage(newMember);
        }
    })
}

function postWelcomeMessage(member) {
    let username = member.toString(); // member.nickname || member.user.username || member.user.id;
    if (!username) {
        clientLog('fail to get member username');
        return null;
    }

    const channel = client.channels.cache.get(config.welcome_message_channel);
    if (!channel) {
        clientLog('welcome message channel not found');
        return null;
    }

    const embed = new MessageEmbed(); 
    embed.setTitle(config.welcome_message_title); 
    embed.setDescription(config.welcome_message_body.replace('{username}', username));
    channel.send(embed); 

    // channel.send(config.welcome_message.replace('{username}', username));
}

function getNewRoles(oldMember, newMember) {
    let oldMemberRoles = [],
        newMemberRoles = [];
    oldMember.roles.cache.map(function(role){
        oldMemberRoles.push(role.name);
    });
    newMember.roles.cache.map(function(role){
        newMemberRoles.push(role.name);
    });

    let newRoles = [];
    newMemberRoles.map(function(roleName){
        if (oldMemberRoles.indexOf(roleName) <= -1) {
            newRoles.push(roleName);
        }
    });

    return newRoles;
}
