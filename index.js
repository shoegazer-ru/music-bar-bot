const {Client, MessageEmbed} = require("discord.js");
const config = require("./config.json");

const App = {
    client: null,

    start: function(){
        App.log('start bot service');

        this.client = new Client();

        this.client.on("ready", function(){
            App.log(`client becomes ready to start`);
            App.log(`I am ready! Logged in as ${App.client.user.tag}!`);
        });

        this.client.on("guildMemberUpdate", function(oldMember, newMember){
            App.log('a guild member updated ' + App.getMemberView(newMember));
            App.handleWelcomeRoleAdd(oldMember, newMember);
        });

        this.client.on("userUpdate", function(oldMember, newMember){
            App.log('a user updated ' + App.getMemberView(newMember));
            App.handleWelcomeRoleAdd(oldMember, newMember);
        });

        this.client.on("presenceUpdate", function(oldMember, newMember){
            App.log('a precense updated ' + App.getMemberView(newMember));
            App.handleWelcomeRoleAdd(oldMember, newMember);
        });

        this.client.login(config.bot_token);
    },

    log: function(message, data){
        message = '[' + App.getCurrentDateTimeString() + '] - ' + message;
        if (!data) {
            console.log(message);
        } else {
            console.log(message, data);
        }
    },

    handleWelcomeRoleAdd: function(oldMember, newMember){
        let newRoles = App.getNewRoles(oldMember, newMember);
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

        App.log('welcome message posted for user ' + App.getMemberView(member));
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
    },

    getCurrentDateTimeString: function() {
        const currentdate = new Date(); 
        return currentdate.getFullYear() + "-"
            + (App.zerofillDateValue(currentdate.getMonth()+1))  + "-" 
            + App.zerofillDateValue(currentdate.getDate()) + " "  
            + App.zerofillDateValue(currentdate.getHours()) + ":"  
            + App.zerofillDateValue(currentdate.getMinutes()) + ":" 
            + App.zerofillDateValue(currentdate.getSeconds());
    },

    zerofillDateValue: function(value) {
        if (value >= 10) {
            return value;
        }

        return '0' + value;
    },

    getMemberView: function(member) {
        return member.user.username + ' (' + member.nickname + ')' + ' id:' + member.user.id;
    }
};

App.start();
