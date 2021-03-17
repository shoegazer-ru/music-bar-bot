const {Client, MessageEmbed} = require("discord.js");
const config = require("./config.json");

App.start();

const App = {
    client: null,

    start: function(){
        App.log('start bot service');

        this.client = new Client();

        this.client.on("ready", function(){
            App.log(`the this.client becomes ready to start`);
            App.log(`I am ready! Logged in as ${this.client.user.tag}!`);
        });

        this.client.on("guildMemberUpdate", function(oldMember, newMember){
            App.log(`a guild member updated`);
            App.handleWelcomeRoleAdd(oldMember, newMember);
        });

        this.client.on("userUpdate", function(oldMember, newMember){
            App.log(`a user updated`);
            App.handleWelcomeRoleAdd(oldMember, newMember);
        });

        this.client.on("presenceUpdate", function(oldMember, newMember){
            App.log('a precense updated');
            App.handleWelcomeRoleAdd(oldMember, newMember);
        });

        this.client.login(config.bot_token);
    },

    log: function(message, data){
        if (!data) {
            console.log(message);
        } else {
            console.log(message, data);
        }
    },

    handleWelcomeRoleAdd: function(oldMember, newMember){
        let newRoles = getNewRoles(oldMember, newMember);
        if (!newRoles || !newRoles.length) {
            return null;
        }

        newRoles.map(function(roleName){
            if (roleName == config.welcome_role) {
                App.postWelcomeMessage(newMember);
            }
        })
    },

    postWelcomeMessage: function(member) {
        let username = member.toString(); // member.nickname || member.user.username || member.user.id;
        if (!username) {
            App.log('fail to get member username');
            return null;
        }

        const channel = App.client.channels.cache.get(config.welcome_message_channel);
        if (!channel) {
            App.log('welcome message channel not found');
            return null;
        }

        const embed = new MessageEmbed(); 
        embed.setTitle(config.welcome_message_title); 
        embed.setDescription(config.welcome_message_body.replace('{username}', username));
        channel.send(embed); 
    },

    getNewRoles: function(oldMember, newMember) {
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
};
